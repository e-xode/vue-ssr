import { describe, it, expect, vi } from 'vitest';
import { LOG_SUMMARIES } from '@/composables/logSummaryConstants';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key, params = {}) => `${key}|${JSON.stringify(params)}`,
  }),
}));

import { useLogSummary } from '@/composables/useLogSummary';

describe('composables/useLogSummary.js', () => {
  const { summarizeLog, hasDetails, formatDetails } = useLogSummary();

  it('summarizes a sign-in with the email', () => {
    const summary = summarizeLog({ event: 'user-signin', meta: { email: 'a@b.co' } });

    expect(summary).toBe('admin.logs.summary.userSignin|{"email":"a@b.co"}');
  });

  it('translates the failure reason', () => {
    const summary = summarizeLog({
      event: 'auth-failed',
      meta: { email: 'a@b.co', reason: 'invalid-password' },
    });

    expect(summary).toContain('admin.logs.summary.authFailed');
    expect(summary).toContain('admin.logs.reason.invalidPassword|{}');
  });

  it('keeps an unknown reason as is', () => {
    const summary = summarizeLog({ event: 'auth-code-failed', meta: { reason: 'odd' } });

    expect(summary).toContain('"reason":"odd"');
  });

  it('shortens long ids and lists changed fields', () => {
    const blocked = summarizeLog({
      event: 'admin-user-block',
      meta: { targetUserId: '507f1f77bcf86cd799439011' },
    });
    const updated = summarizeLog({
      event: 'admin-user-update',
      meta: { changes: { name: 'x', type: 'admin' } },
    });

    expect(blocked).toContain('"targetUserId":"507f1f77…"');
    expect(updated).toContain('"fields":"name, type"');
  });

  it('uses a placeholder when the metadata is missing', () => {
    expect(summarizeLog({ event: 'contact-sent' })).toContain('"name":"—","email":"—"');
    expect(summarizeLog({ event: 'user-update-profile', meta: {} })).toContain('"fields":"—"');
  });

  it('falls back to the unknown summary for unrecognized events', () => {
    expect(summarizeLog({ event: 'custom-event' })).toBe(
      'admin.logs.summary.unknown|{"event":"custom-event"}'
    );
    expect(summarizeLog({ event: 'constructor' })).toContain('admin.logs.summary.unknown');
    expect(summarizeLog(null)).toContain('admin.logs.summary.unknown');
  });

  it('covers every event the kit writes', () => {
    const kitEvents = [
      'user-signin',
      'user-signout',
      'user-signup',
      'auth-failed',
      'auth-code-verified',
      'auth-code-failed',
      'auth-resend-code',
      'user-update-profile',
      'user-update-password',
      'user-forgot-password',
      'user-reset-password',
      'user-change-email-request',
      'user-change-email-verified',
      'user-update-avatar',
      'user-delete-avatar',
      'admin-user-update',
      'admin-user-block',
      'admin-user-unblock',
      'admin-user-delete',
      'admin-ip-block',
      'admin-ip-unblock',
      'contact-sent',
    ];

    expect(Object.keys(LOG_SUMMARIES).sort()).toEqual([...kitEvents].sort());
  });

  it('detects and formats the raw details', () => {
    expect(hasDetails({ meta: { a: 1 } })).toBe(true);
    expect(hasDetails({ meta: {} })).toBe(false);
    expect(hasDetails({})).toBe(false);
    expect(formatDetails({ meta: { a: 1 } })).toBe('{\n  "a": 1\n}');
    expect(formatDetails({})).toBe('{}');
  });
});
