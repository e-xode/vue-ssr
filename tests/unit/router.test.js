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
    const homeRoute = routes.find(r => r.name === 'Index')

    expect(homeRoute).toBeDefined()
    expect(homeRoute?.path).toContain('/:locale')
  })

  it('should have signup route', () => {
    const routes = router.getRoutes()
    const signupRoute = routes.find(r => r.name === 'Signup')

    expect(signupRoute).toBeDefined()
    expect(signupRoute?.path).toContain('/signup')
  })

  it('should have signin route', () => {
    const routes = router.getRoutes()
    const signinRoute = routes.find(r => r.name === 'Signin')

    expect(signinRoute).toBeDefined()
    expect(signinRoute?.path).toContain('/signin')
  })

  it('should have verify-code route', () => {
    const routes = router.getRoutes()
    const verifyRoute = routes.find(r => r.name === 'VerifyCode')

    expect(verifyRoute).toBeDefined()
    expect(verifyRoute?.path).toContain('/auth/verify-code')
  })

  it('should have dashboard route with requiresAuth meta', () => {
    const routes = router.getRoutes()
    const dashboardRoute = routes.find(r => r.name === 'Dashboard')

    expect(dashboardRoute).toBeDefined()
    expect(dashboardRoute?.meta?.requiresAuth).toBe(true)
  })

  it('should have 404 route', () => {
    const routes = router.getRoutes()
    const notFoundRoute = routes.find(r => r.path === '/:pathMatch(.*)*')

    expect(notFoundRoute).toBeDefined()
  })

  it('should have root redirect', () => {
    const routes = router.getRoutes()
    const rootRoute = routes.find(r => r.path === '/')

    expect(rootRoute).toBeDefined()
    expect(rootRoute?.redirect).toBeDefined()
  })

  it('should have contact route', () => {
    const routes = router.getRoutes()
    const contactRoute = routes.find(r => r.name === 'Contact')

    expect(contactRoute).toBeDefined()
    expect(contactRoute?.path).toContain('/contact')
    expect(contactRoute?.meta?.layout).toBe('public')
  })

  it('routes should have valid components', () => {
    const routes = router.getRoutes()

    routes.forEach(route => {
      if (route.component) {
        expect(route.component).toBeDefined()
      }
    })
  })

  it('should have correct route meta layout', () => {
    const routes = router.getRoutes()

    const homeRoute = routes.find(r => r.name === 'Index')
    expect(homeRoute?.meta?.layout).toBe('public')

    const dashboardRoute = routes.find(r => r.name === 'Dashboard')
    expect(dashboardRoute?.meta?.layout).toBe('app')
  })
})
