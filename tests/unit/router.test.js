import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createAppRouter } from '#src/router';

vi.mock('#src/shared/api', () => ({
  apiFetch: vi.fn().mockResolvedValue({ user: null }),
}));

const router = createAppRouter();

describe('router.js', () => {
  it('should have correct routes defined', () => {
    const routes = router.getRoutes();

    expect(routes.length).toBeGreaterThan(0);
  });

  it('should have home route', () => {
    const routes = router.getRoutes();
    const homeRoute = routes.find((r) => r.name === 'Index');

    expect(homeRoute).toBeDefined();
    expect(homeRoute?.path).toContain('/:locale');
  });

  it('should have signup route', () => {
    const routes = router.getRoutes();
    const signupRoute = routes.find((r) => r.name === 'Signup');

    expect(signupRoute).toBeDefined();
    expect(signupRoute?.path).toContain('/signup');
  });

  it('should have signin route', () => {
    const routes = router.getRoutes();
    const signinRoute = routes.find((r) => r.name === 'Signin');

    expect(signinRoute).toBeDefined();
    expect(signinRoute?.path).toContain('/signin');
  });

  it('should have verify-code route', () => {
    const routes = router.getRoutes();
    const verifyRoute = routes.find((r) => r.name === 'VerifyCode');

    expect(verifyRoute).toBeDefined();
    expect(verifyRoute?.path).toContain('/auth/verify-code');
  });

  it('should have dashboard route with requiresAuth meta', () => {
    const routes = router.getRoutes();
    const dashboardRoute = routes.find((r) => r.name === 'Dashboard');

    expect(dashboardRoute).toBeDefined();
    expect(dashboardRoute?.meta?.requiresAuth).toBe(true);
  });

  it('should have 404 route', () => {
    const routes = router.getRoutes();
    const notFoundRoute = routes.find((r) => r.path === '/:pathMatch(.*)*');

    expect(notFoundRoute).toBeDefined();
  });

  it('should have root redirect', () => {
    const routes = router.getRoutes();
    const rootRoute = routes.find((r) => r.path === '/');

    expect(rootRoute).toBeDefined();
    expect(rootRoute?.redirect).toBeDefined();
  });

  it('should have contact route', () => {
    const routes = router.getRoutes();
    const contactRoute = routes.find((r) => r.name === 'Contact');

    expect(contactRoute).toBeDefined();
    expect(contactRoute?.path).toContain('/contact');
    expect(contactRoute?.meta?.layout).toBe('public');
  });

  it('routes should have valid components', () => {
    const routes = router.getRoutes();

    routes.forEach((route) => {
      if (route.component) {
        expect(route.component).toBeDefined();
      }
    });
  });

  it('should have correct route meta layout', () => {
    const routes = router.getRoutes();

    const homeRoute = routes.find((r) => r.name === 'Index');
    expect(homeRoute?.meta?.layout).toBe('public');

    const dashboardRoute = routes.find((r) => r.name === 'Dashboard');
    expect(dashboardRoute?.meta?.layout).toBe('app');
  });

  it('should resolve the localized page routes', () => {
    expect(router.resolve('/fr/contact').name).toBe('Contact');
    expect(router.resolve('/en').name).toBe('Index');
  });
});

describe('router.js prefetch contract', () => {
  const component = { template: '<div />' };
  let pinia;
  let prefetch;

  function createRouterWithPrefetch(options) {
    const prefetchRouter = createAppRouter({ pinia, ...options });
    prefetchRouter.addRoute({ path: '/data', component, meta: { prefetch } });
    prefetchRouter.addRoute({ path: '/other', component });
    return prefetchRouter;
  }

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    prefetch = vi.fn().mockResolvedValue(undefined);
  });

  it('runs the route prefetch with the route and pinia on client navigation', async () => {
    const prefetchRouter = createRouterWithPrefetch();

    await prefetchRouter.push('/data');

    expect(prefetch).toHaveBeenCalledTimes(1);
    expect(prefetch.mock.calls[0][0].route.path).toBe('/data');
    expect(prefetch.mock.calls[0][0].pinia).toBe(pinia);
  });

  it('skips the prefetch of the first navigation when the state is hydrated', async () => {
    const prefetchRouter = createRouterWithPrefetch({ hydrated: true });

    await prefetchRouter.push('/data');
    expect(prefetch).not.toHaveBeenCalled();

    await prefetchRouter.push('/other');
    await prefetchRouter.push('/data');
    expect(prefetch).toHaveBeenCalledTimes(1);
  });

  it('logs a failing prefetch and still completes the navigation', async () => {
    prefetch.mockRejectedValue(new Error('boom'));
    const prefetchRouter = createRouterWithPrefetch();

    await prefetchRouter.push('/data');

    expect(prefetchRouter.currentRoute.value.path).toBe('/data');
    expect(console.error).toHaveBeenCalled();
  });

  it('ignores routes without a prefetch', async () => {
    const prefetchRouter = createRouterWithPrefetch();

    await prefetchRouter.push('/other');

    expect(prefetch).not.toHaveBeenCalled();
  });
});
