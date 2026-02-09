// tests/unit/stores.auth.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '#src/stores/auth'

// Mock fetchAPI
global.fetch = vi.fn()

describe('stores/auth.js', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    global.fetch.mockClear()
  })

  describe('useAuthStore', () => {
    it('should initialize with null user', () => {
      const store = useAuthStore()

      expect(store.user).toBeNull()
      expect(store.email).toBeNull() // Now computed property
    })

    it('should have isAuthenticated computed property', () => {
      const store = useAuthStore()

      expect(store.isAuthenticated).toBe(false)

      store.user = { _id: '1', email: 'test@example.com' }
      expect(store.isAuthenticated).toBe(true)
    })

    it('should have loading state', () => {
      const store = useAuthStore()

      expect(store.loading).toBe(false)
    })

    it('should have error state', () => {
      const store = useAuthStore()

      expect(store.error).toBeNull()
    })

    it('should update user when setUser is called', () => {
      const store = useAuthStore()
      const newUser = { _id: '1', email: 'test@example.com', name: 'Test' }

      store.setUser(newUser)

      expect(store.user).toEqual(newUser)
      expect(store.email).toBe('test@example.com')
    })

    it('should clear user when clearUser is called', () => {
      const store = useAuthStore()
      store.user = { _id: '1', email: 'test@example.com' }

      store.clearUser()

      expect(store.user).toBeNull()
      expect(store.email).toBeNull()
    })

    it('should update error state', () => {
      const store = useAuthStore()
      const testError = 'Test error message'

      store.setError(testError)

      expect(store.error).toBe(testError)
    })

    it('should clear error', () => {
      const store = useAuthStore()
      store.error = 'Some error'

      store.clearError()

      expect(store.error).toBeNull()
    })

    it('should initialize user from server on first check', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { _id: '1', email: 'test@example.com' } })
      })

      const store = useAuthStore()
      await store.initializeUser()

      expect(store.user).toEqual({ _id: '1', email: 'test@example.com' })
    })

    it('should not fetch user twice', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { _id: '1', email: 'test@example.com' } })
      })

      const store = useAuthStore()
      await store.initializeUser()
      await store.initializeUser()

      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })
})
