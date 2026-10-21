export const EMPTY_VALUE = '—';

export const SHORT_ID_LENGTH = 8;

export const LOG_REASON_KEYS = {
  'ip-blocked': 'ipBlocked',
  'user-not-found': 'userNotFound',
  'user-blocked': 'userBlocked',
  'invalid-password': 'invalidPassword',
  'too-many-attempts': 'tooManyAttempts',
  'invalid-code': 'invalidCode',
  'reset-password': 'resetPassword',
};

const orEmpty = (value) => value ?? EMPTY_VALUE;

const joinOrEmpty = (values) => (values?.length ? values.join(', ') : EMPTY_VALUE);

const shortId = (id) => {
  if (!id) return EMPTY_VALUE;
  const text = String(id);
  return text.length > SHORT_ID_LENGTH + 2 ? `${text.slice(0, SHORT_ID_LENGTH)}…` : text;
};

export const LOG_SUMMARIES = {
  'user-signin': { key: 'userSignin', params: (meta) => ({ email: orEmpty(meta?.email) }) },
  'user-signout': { key: 'userSignout', params: () => ({}) },
  'user-signup': { key: 'userSignup', params: (meta) => ({ email: orEmpty(meta?.email) }) },
  'auth-failed': {
    key: 'authFailed',
    params: (meta, reasonLabel) => ({
      email: orEmpty(meta?.email),
      reason: reasonLabel(meta?.reason),
    }),
  },
  'auth-code-verified': {
    key: 'authCodeVerified',
    params: (meta) => ({ email: orEmpty(meta?.email) }),
  },
  'auth-code-failed': {
    key: 'authCodeFailed',
    params: (meta, reasonLabel) => ({
      email: orEmpty(meta?.email),
      reason: reasonLabel(meta?.reason),
    }),
  },
  'auth-resend-code': {
    key: 'authResendCode',
    params: (meta) => ({ email: orEmpty(meta?.email) }),
  },
  'user-update-profile': {
    key: 'userUpdateProfile',
    params: (meta) => ({ fields: joinOrEmpty(meta?.fields) }),
  },
  'user-update-password': { key: 'userUpdatePassword', params: () => ({}) },
  'user-forgot-password': {
    key: 'userForgotPassword',
    params: (meta) => ({ email: orEmpty(meta?.email) }),
  },
  'user-reset-password': { key: 'userResetPassword', params: () => ({}) },
  'user-change-email-request': {
    key: 'userChangeEmailRequest',
    params: (meta) => ({ email: orEmpty(meta?.newEmail) }),
  },
  'user-change-email-verified': {
    key: 'userChangeEmailVerified',
    params: (meta) => ({ email: orEmpty(meta?.newEmail) }),
  },
  'user-update-avatar': { key: 'userUpdateAvatar', params: () => ({}) },
  'user-delete-avatar': { key: 'userDeleteAvatar', params: () => ({}) },
  'admin-user-update': {
    key: 'adminUserUpdate',
    params: (meta) => ({ fields: joinOrEmpty(Object.keys(meta?.changes ?? {})) }),
  },
  'admin-user-block': {
    key: 'adminUserBlock',
    params: (meta) => ({ targetUserId: shortId(meta?.targetUserId) }),
  },
  'admin-user-unblock': {
    key: 'adminUserUnblock',
    params: (meta) => ({ targetUserId: shortId(meta?.targetUserId) }),
  },
  'admin-user-delete': {
    key: 'adminUserDelete',
    params: (meta) => ({ targetUserId: shortId(meta?.targetUserId) }),
  },
  'admin-ip-block': { key: 'adminIpBlock', params: (meta) => ({ ip: orEmpty(meta?.blockedIp) }) },
  'admin-ip-unblock': {
    key: 'adminIpUnblock',
    params: (meta) => ({ ip: orEmpty(meta?.unblockedIp) }),
  },
  'contact-sent': {
    key: 'contactSent',
    params: (meta) => ({ name: orEmpty(meta?.name), email: orEmpty(meta?.email) }),
  },
};
