import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from '@/shared/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const pendingEmail = ref(null)
  const verificationContext = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.type === 'admin')
  const email = computed(() => user.value?.email || null)

  function setUser(newUser) {
    user.value = newUser
  }

  function clearUser() {
    user.value = null
  }

  function setError(errorMsg) {
    error.value = errorMsg
  }

  function clearError() {
    error.value = null
  }

  function updateUser(updatedData) {
    if (user.value) {
      user.value = { ...user.value, ...updatedData }
    }
  }

  function setPendingVerification(email, context) {
    pendingEmail.value = email
    verificationContext.value = context
  }

  function clearPendingVerification() {
    pendingEmail.value = null
    verificationContext.value = null
  }

  async function initializeUser() {
    if (user.value) return
    await fetchUser()
  }

  async function fetchUser() {
    loading.value = true
    error.value = null
    try {
      const data = await apiFetch('/api/auth/me')
      user.value = data.user
    } catch {
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function signup({ email, password, name, captchaToken }) {
    loading.value = true
    error.value = null
    try {
      const data = await apiFetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, captchaToken })
      })
      verificationContext.value = 'signup'
      pendingEmail.value = email
      return { status: 'success', data }
    } catch (e) {
      error.value = e.error || e.message
      return { status: 'error', error: e.error || e.message }
    } finally {
      loading.value = false
    }
  }

  async function signin({ email, password, captchaToken }) {
    loading.value = true
    error.value = null
    try {
      const data = await apiFetch('/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password, captchaToken })
      })
      verificationContext.value = 'signin'
      pendingEmail.value = email
      return { status: 'success', data }
    } catch (e) {
      error.value = e.error || e.message
      return { status: 'error', error: e.error || e.message }
    } finally {
      loading.value = false
    }
  }

  async function verifyCode(email, code) {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })
      const data = await response.json()
      if (response.ok) {
        user.value = data.user
        pendingEmail.value = null
        verificationContext.value = null
        return { status: 'success', user: data.user }
      } else {
        error.value = data.error
        return { status: 'error', error: data.error, attempts: data.attempts }
      }
    } catch (e) {
      error.value = e.message
      return { status: 'error', error: e.message }
    } finally {
      loading.value = false
    }
  }

  async function signout() {
    loading.value = true
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include'
      })
      user.value = null
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
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
    signout
  }
})
