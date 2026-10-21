import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const mockApiFetch = vi.fn();
vi.mock('#src/shared/api', () => ({
  apiFetch: (...args) => mockApiFetch(...args),
}));

import { useAuthStore } from '#src/stores/auth';

function lastRequestBody() {
  return JSON.parse(mockApiFetch.mock.calls.at(-1)[1].body);
}

describe('stores/auth.js', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockApiFetch.mockReset();
  });

  describe('useAuthStore', () => {
    it('should initialize with null user', () => {
      const store = useAuthStore();

      expect(store.user).toBeNull();
      expect(store.email).toBeNull();
    });

    it('should have isAuthenticated computed property', () => {
      const store = useAuthStore();

      expect(store.isAuthenticated).toBe(false);

      store.user = { _id: '1', email: 'test@example.com' };
      expect(store.isAuthenticated).toBe(true);
    });

    it('should have loading state', () => {
      const store = useAuthStore();

      expect(store.loading).toBe(false);
    });

    it('should have error state', () => {
      const store = useAuthStore();

      expect(store.error).toBeNull();
    });

    it('should update user when setUser is called', () => {
      const store = useAuthStore();
      const newUser = { _id: '1', email: 'test@example.com', name: 'Test' };

      store.setUser(newUser);

      expect(store.user).toEqual(newUser);
      expect(store.email).toBe('test@example.com');
    });

    it('should clear user when clearUser is called', () => {
      const store = useAuthStore();
      store.user = { _id: '1', email: 'test@example.com' };

      store.clearUser();

      expect(store.user).toBeNull();
      expect(store.email).toBeNull();
    });

    it('should update error state', () => {
      const store = useAuthStore();
      const testError = 'Test error message';

      store.setError(testError);

      expect(store.error).toBe(testError);
    });

    it('should clear error', () => {
      const store = useAuthStore();
      store.error = 'Some error';

      store.clearError();

      expect(store.error).toBeNull();
    });

    it('should initialize user from server on first check', async () => {
      mockApiFetch.mockResolvedValueOnce({ user: { _id: '1', email: 'test@example.com' } });

      const store = useAuthStore();
      await store.initializeUser();

      expect(store.user).toEqual({ _id: '1', email: 'test@example.com' });
    });

    it('should not fetch user twice', async () => {
      mockApiFetch.mockResolvedValueOnce({ user: { _id: '1', email: 'test@example.com' } });

      const store = useAuthStore();
      await store.initializeUser();
      await store.initializeUser();

      expect(mockApiFetch).toHaveBeenCalledTimes(1);
    });

    it('should log and clear the user when fetching the user fails', async () => {
      mockApiFetch.mockRejectedValueOnce(new Error('network'));

      const store = useAuthStore();
      store.user = { _id: '1' };
      await store.fetchUser();

      expect(store.user).toBeNull();
      expect(store.loading).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('locale in credential payloads', () => {
    it('should send the locale when signing up', async () => {
      mockApiFetch.mockResolvedValueOnce({ status: 'verification_pending' });
      const store = useAuthStore();

      const result = await store.signup({
        email: 'a@b.co',
        password: 'secret',
        name: 'A',
        captchaToken: 't',
        locale: 'fr',
      });

      expect(result.status).toBe('success');
      expect(lastRequestBody()).toMatchObject({ email: 'a@b.co', locale: 'fr' });
      expect(store.pendingEmail).toBe('a@b.co');
      expect(store.verificationContext).toBe('signup');
    });

    it('should send the locale when signing in', async () => {
      mockApiFetch.mockResolvedValueOnce({ status: 'verification_pending' });
      const store = useAuthStore();

      await store.signin({ email: 'a@b.co', password: 'secret', captchaToken: 't', locale: 'fr' });

      expect(mockApiFetch.mock.calls[0][0]).toBe('/api/auth/signin');
      expect(lastRequestBody()).toMatchObject({ locale: 'fr' });
    });

    it('should send the locale when resending the code', async () => {
      mockApiFetch.mockResolvedValueOnce({ status: 'code_sent' });
      const store = useAuthStore();

      const result = await store.resendCode({ email: 'a@b.co', locale: 'fr' });

      expect(result).toEqual({ status: 'success' });
      expect(mockApiFetch.mock.calls[0][0]).toBe('/api/auth/resend-code');
      expect(lastRequestBody()).toEqual({ email: 'a@b.co', locale: 'fr' });
    });

    it('should expose the cooldown when resending too soon', async () => {
      mockApiFetch.mockRejectedValueOnce(
        Object.assign(new Error('wait'), {
          error: 'error.auth.waitBeforeResend',
          data: { waitSeconds: 12 },
        })
      );
      const store = useAuthStore();

      const result = await store.resendCode({ email: 'a@b.co', locale: 'en' });

      expect(result).toEqual({
        status: 'error',
        error: 'error.auth.waitBeforeResend',
        waitSeconds: 12,
      });
    });
  });

  describe('verifyCode', () => {
    it('should store the user and clear the pending verification', async () => {
      mockApiFetch.mockResolvedValueOnce({ status: 'verified', user: { _id: '1' } });
      const store = useAuthStore();
      store.setPendingVerification('a@b.co', 'signin');

      const result = await store.verifyCode('a@b.co', '123456');

      expect(mockApiFetch.mock.calls[0][0]).toBe('/api/auth/verify-code');
      expect(lastRequestBody()).toEqual({ email: 'a@b.co', code: '123456' });
      expect(result).toEqual({ status: 'success', user: { _id: '1' } });
      expect(store.user).toEqual({ _id: '1' });
      expect(store.pendingEmail).toBeNull();
      expect(store.loading).toBe(false);
    });

    it('should return the error key and the remaining attempts', async () => {
      mockApiFetch.mockRejectedValueOnce(
        Object.assign(new Error('invalid'), {
          error: 'error.auth.invalidCode',
          data: { attempts: 2 },
        })
      );
      const store = useAuthStore();

      const result = await store.verifyCode('a@b.co', '000000');

      expect(result).toEqual({ status: 'error', error: 'error.auth.invalidCode', attempts: 2 });
      expect(store.error).toBe('error.auth.invalidCode');
      expect(store.user).toBeNull();
      expect(store.loading).toBe(false);
    });
  });

  describe('signout', () => {
    it('should clear the user after a successful signout', async () => {
      mockApiFetch.mockResolvedValueOnce({ status: 'success' });
      const store = useAuthStore();
      store.user = { _id: '1' };

      await store.signout();

      expect(mockApiFetch.mock.calls[0][0]).toBe('/api/auth/signout');
      expect(mockApiFetch.mock.calls[0][1].method).toBe('POST');
      expect(store.user).toBeNull();
    });

    it('should clear the user even when the request fails', async () => {
      mockApiFetch.mockRejectedValueOnce(new Error('network'));
      const store = useAuthStore();
      store.user = { _id: '1' };

      await store.signout();

      expect(store.user).toBeNull();
      expect(store.error).toBe('network');
      expect(store.loading).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });
});
