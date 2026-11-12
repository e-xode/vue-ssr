import { requireAuth } from '../middleware.js';
import { EMAIL_REGEX, SECURITY_CODE_EXPIRY_MS } from '#src/shared/const.js';
import { generateSecurityCode, hashCode, sendEmailChangeCodeEmail } from '#src/shared/email.js';
import {
  checkSubmittedCode,
  CODE_CHECK,
  CODE_FAILURES_UNSET,
  destroyUserSessions,
  remainingCodeAttempts,
  startUserSession,
} from '#src/shared/security.js';
import { isDuplicateKeyError } from '#src/shared/dbHelpers.js';
import { logEvent } from '#src/shared/logger.js';
import { readEmail, readString, readTrimmed } from '#src/shared/utils.js';
import { deliverEmail } from '#src/api/emailDelivery.js';

const ATTEMPTS_FIELD = 'pendingEmailCodeAttempts';

const PENDING_EMAIL_UNSET = {
  pendingEmail: '',
  pendingEmailCode: '',
  pendingEmailCodeExpires: '',
  [ATTEMPTS_FIELD]: '',
};

const PENDING_EMAIL_PROJECTION = {
  pendingEmail: 1,
  pendingEmailCode: 1,
  pendingEmailCodeExpires: 1,
  [ATTEMPTS_FIELD]: 1,
  codeFailures: 1,
  codeFailuresSince: 1,
};

const EMAIL_TAKEN = { status: 409, error: 'error.auth.emailAlreadyUsed' };

async function clearPendingEmail(db, userId) {
  await db.collection('users').updateOne({ _id: userId }, { $unset: PENDING_EMAIL_UNSET });
}

async function finalizeEmailChange(req, db, newEmail) {
  await db
    .collection('users')
    .updateOne(
      { _id: req.userId },
      { $set: { email: newEmail }, $unset: { ...PENDING_EMAIL_UNSET, ...CODE_FAILURES_UNSET } }
    );

  await destroyUserSessions(req.userId, req.sessionID);
  await startUserSession(req, req.userId, { createdAt: req.session.createdAt });
}

async function verifyEmailChangeCode(req, res, db, user, code) {
  if (new Date() > user.pendingEmailCodeExpires) {
    await clearPendingEmail(db, req.userId);
    res.status(400).json({ error: 'error.auth.codeExpired' });
    return false;
  }

  const outcome = await checkSubmittedCode(db, user, {
    code,
    storedHash: user.pendingEmailCode,
    attemptsField: ATTEMPTS_FIELD,
  });

  if (outcome === CODE_CHECK.LOCKED || outcome === CODE_CHECK.EXHAUSTED) {
    if (outcome === CODE_CHECK.EXHAUSTED) await clearPendingEmail(db, req.userId);
    res.status(429).json({ error: 'error.auth.tooManyAttempts' });
    return false;
  }

  if (outcome === CODE_CHECK.INVALID) {
    res.status(401).json({
      error: 'error.auth.invalidCode',
      attempts: remainingCodeAttempts(user[ATTEMPTS_FIELD]),
    });
    return false;
  }

  return true;
}

async function handleChangeEmail(req, res, db) {
  try {
    const normalizedEmail = readEmail(req.body.newEmail);
    const locale = readString(req.body.locale);

    if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ error: 'error.invalidEmail' });
    }

    const user = await db
      .collection('users')
      .findOne({ _id: req.userId }, { projection: { email: 1 } });

    if (normalizedEmail === user.email) {
      return res.status(400).json({ error: 'error.auth.sameEmail' });
    }

    const existing = await db
      .collection('users')
      .findOne({ email: normalizedEmail }, { projection: { _id: 1 } });

    if (existing) {
      return res.status(EMAIL_TAKEN.status).json({ error: EMAIL_TAKEN.error });
    }

    const code = generateSecurityCode();

    await db.collection('users').updateOne(
      { _id: req.userId },
      {
        $set: {
          pendingEmail: normalizedEmail,
          pendingEmailCode: hashCode(code),
          pendingEmailCodeExpires: new Date(Date.now() + SECURITY_CODE_EXPIRY_MS),
          [ATTEMPTS_FIELD]: 0,
        },
      }
    );

    const sending = sendEmailChangeCodeEmail(normalizedEmail, code, locale || 'en');
    if (!(await deliverEmail(res, sending))) return;

    logEvent(db, {
      event: 'user-change-email-request',
      userId: req.userId,
      ip: req.ip,
      meta: { newEmail: normalizedEmail },
    });

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Change email error:', err);
    res.status(500).json({ error: 'error.server' });
  }
}

async function handleVerifyEmailChange(req, res, db) {
  try {
    const code = readTrimmed(req.body.code);

    if (!code) {
      return res.status(400).json({ error: 'error.missingFields' });
    }

    const user = await db
      .collection('users')
      .findOne({ _id: req.userId }, { projection: PENDING_EMAIL_PROJECTION });

    if (!user.pendingEmail || !user.pendingEmailCode) {
      return res.status(400).json({ error: 'error.auth.noPendingEmail' });
    }

    const codeValid = await verifyEmailChangeCode(req, res, db, user, code);
    if (!codeValid) return;

    const existing = await db
      .collection('users')
      .findOne({ email: user.pendingEmail }, { projection: { _id: 1 } });

    if (existing) {
      await clearPendingEmail(db, req.userId);
      return res.status(EMAIL_TAKEN.status).json({ error: EMAIL_TAKEN.error });
    }

    await finalizeEmailChange(req, db, user.pendingEmail);

    logEvent(db, {
      event: 'user-change-email-verified',
      userId: req.userId,
      ip: req.ip,
      meta: { newEmail: user.pendingEmail },
    });

    res.json({ status: 'ok', email: user.pendingEmail });
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      return res.status(EMAIL_TAKEN.status).json({ error: EMAIL_TAKEN.error });
    }
    console.error('Verify email change error:', err);
    res.status(500).json({ error: 'error.server' });
  }
}

export function setupChangeEmailRoute(app, db) {
  app.post('/api/auth/change-email', requireAuth, (req, res) => handleChangeEmail(req, res, db));

  app.post('/api/auth/verify-email-change', requireAuth, (req, res) =>
    handleVerifyEmailChange(req, res, db)
  );
}
