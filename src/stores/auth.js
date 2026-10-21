import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiFetch } from '@/shared/api';

async function submitAuthCredentials(endpoint, payload, context, refs) {
  refs.loading.value = true;
  refs.error.value = null;
  try {
    const data = await apiFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    refs.verificationContext.value = context;
    refs.pendingEmail.value = payload.email;
    return { status: 'success', data };
  } catch (e) {
    console.error(e);
    refs.error.value = e.error || e.message;
    return { status: 'error', error: e.error || e.message };
  } finally {
    refs.loading.value = false;
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const pendingEmail = ref(null);
  const verificationContext = ref(null);

  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.type === 'admin');
  const email = computed(() => user.value?.email || null);

  function setUser(newUser) {
    user.value = newUser;
  }

  function clearUser() {
    user.value = null;
  }

  function setError(errorMsg) {
    error.value = errorMsg;
  }

  function clearError() {
    error.value = null;
  }

  function updateUser(updatedData) {
    if (user.value) {
      user.value = { ...user.value, ...updatedData };
    }
  }

  function setPendingVerification(email, context) {
    pendingEmail.value = email;
    verificationContext.value = context;
  }

  function clearPendingVerification() {
    pendingEmail.value = null;
    verificationContext.value = null;
  }

  async function initializeUser() {
    if (user.value) return;
    await fetchUser();
  }

  async function fetchUser() {
    loading.value = true;
    error.value = null;
    try {
      const data = await apiFetch('/api/auth/me');
      user.value = data.user;
    } catch (err) {
      console.error(err);
      user.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function signup({ email, password, name, captchaToken, locale }) {
    return submitAuthCredentials(
      '/api/auth/signup',
      { email, password, name, captchaToken, locale },
      'signup',
      { loading, error, pendingEmail, verificationContext }
    );
  }

  async function signin({ email, password, captchaToken, locale }) {
    return submitAuthCredentials(
      '/api/auth/signin',
      { email, password, captchaToken, locale },
      'signin',
      { loading, error, pendingEmail, verificationContext }
    );
  }

  async function verifyCode(email, code) {
    loading.value = true;
    error.value = null;
    try {
      const data = await apiFetch('/api/auth/verify-code', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      });
      user.value = data.user;
      pendingEmail.value = null;
      verificationContext.value = null;
      return { status: 'success', user: data.user };
    } catch (e) {
      console.error(e);
      error.value = e.error || e.message;
      return { status: 'error', error: error.value, attempts: e.data?.attempts };
    } finally {
      loading.value = false;
    }
  }

  async function resendCode({ email, locale }) {
    try {
      await apiFetch('/api/auth/resend-code', {
        method: 'POST',
        body: JSON.stringify({ email, locale }),
      });
      return { status: 'success' };
    } catch (e) {
      console.error(e);
      return { status: 'error', error: e.error || e.message, waitSeconds: e.data?.waitSeconds };
    }
  }

  async function signout() {
    loading.value = true;
    try {
      await apiFetch('/api/auth/signout', { method: 'POST' });
    } catch (err) {
      console.error(err);
      error.value = err.error || err.message;
    } finally {
      user.value = null;
      loading.value = false;
    }
  }

  return {
    user,
    email,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    pendingEmail,
    verificationContext,
    fetchUser,
    setUser,
    clearUser,
    setError,
    clearError,
    updateUser,
    setPendingVerification,
    clearPendingVerification,
    initializeUser,
    signup,
    signin,
    verifyCode,
    resendCode,
    signout,
  };
});
