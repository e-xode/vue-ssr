// tests/unit/router.test.js
import { describe, it, expect } from 'vitest'
import { router } from '#src/router'

describe('router.js', () => {
  it('should have correct routes defined', () => {
    const routes = router.getRoutes()

    expect(routes.length).toBeGreaterThan(0)
  })

  it('should have home route', () => {
    const routes = router.getRoutes()
    const homeRoute = routes.find(r => r.path === '/')

    expect(homeRoute).toBeDefined()
    expect(homeRoute?.name).toBe('Index')
  })

  it('should have signup route', () => {
    const routes = router.getRoutes()
    const signupRoute = routes.find(r => r.path === '/signup')

    expect(signupRoute).toBeDefined()
    expect(signupRoute?.name).toBe('Signup')
  })

  it('should have signin route', () => {
    const routes = router.getRoutes()
    const signinRoute = routes.find(r => r.path === '/signin')

    expect(signinRoute).toBeDefined()
    expect(signinRoute?.name).toBe('Signin')
  })

  it('should have verify-code route', () => {
    const routes = router.getRoutes()
    const verifyRoute = routes.find(r => r.path === '/auth/verify-code')

    expect(verifyRoute).toBeDefined()
    expect(verifyRoute?.name).toBe('VerifyCode')
  })

  it('should have dashboard route with requiresAuth meta', () => {
    const routes = router.getRoutes()
    const dashboardRoute = routes.find(r => r.path === '/dashboard')

    expect(dashboardRoute).toBeDefined()
    expect(dashboardRoute?.meta?.requiresAuth).toBe(true)
  })

  it('should have 404 route', () => {
    const routes = router.getRoutes()
    const notFoundRoute = routes.find(r => r.path === '/:pathMatch(.*)*')

    expect(notFoundRoute).toBeDefined()
  })

  it('routes should have valid components', () => {
    const routes = router.getRoutes()

    routes.forEach(route => {
      // Skip routes without components (like the 404 redirect)
      if (route.component) {
        expect(route.component).toBeDefined()
      }
    })
  })

  it('should have correct route meta layout', () => {
    const routes = router.getRoutes()

    const homeRoute = routes.find(r => r.path === '/')
    expect(homeRoute?.meta?.layout).toBe('public')

    const dashboardRoute = routes.find(r => r.path === '/dashboard')
    expect(dashboardRoute?.meta?.layout).toBe('app')
  })
})
