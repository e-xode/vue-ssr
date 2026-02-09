import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const pendingEmail = ref(null)
  const verificationContext = ref(null)

  const isAuthenticated = computed(() => !!user.value)
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

  async function initializeUser() {
    if (user.value) return // Already initialized
    await fetchUser()
  }

  async function fetchUser() {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        user.value = data.user
      } else {
        user.value = null
      }
    } catch (e) {
      error.value = e.message
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function signup({ email, password, name }) {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })
      const data = await response.json()
      if (response.ok) {
        verificationContext.value = 'signup'
        pendingEmail.value = email
        return { status: 'success', data }
      } else {
        error.value = data.error
        return { status: 'error', error: data.error }
      }
    } catch (e) {
      error.value = e.message
      return { status: 'error', error: e.message }
    } finally {
      loading.value = false
    }
  }

  async function signin({ email, password }) {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await response.json()
      if (response.ok) {
        verificationContext.value = 'signin'
        pendingEmail.value = email
        return { status: 'success', data }
      } else {
        error.value = data.error
        return { status: 'error', error: data.error }
      }
    } catch (e) {
      error.value = e.message
      return { status: 'error', error: e.message }
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
        return { status: 'error', error: data.error }
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
    pendingEmail,
    verificationContext,
    fetchUser,
    setUser,
    clearUser,
    setError,
    clearError,
    initializeUser,
    signup,
    signin,
    verifyCode,
    signout
  }
})
