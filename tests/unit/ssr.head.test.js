import { describe, it, expect } from 'vitest';
import { generateHead, buildBreadcrumbs, buildHeadContext } from '@/ssr/head';

const ENV = {
  NODE_HOST: 'https://www.example.com',
  APP_NAME: 'Acme',
  GA_MEASUREMENT_ID: 'G-ABC123',
  RECAPTCHA_SITE_KEY: 'site_key-1',
};

const MESSAGES = {
  'nav.home': 'Home',
  'meta.index.title': 'Acme',
  'meta.contact.title': 'Contact Us',
  'meta.contact.description': 'Write to us',
  'meta.notFound.title': 'Not found',
};

const t = (key) => MESSAGES[key] ?? key;

const ROUTE_META = {
  '/en': { title: 'meta.index.title' },
  '/en/contact': { title: 'meta.contact.title', description: 'meta.contact.description' },
  '/en/missing': { title: 'meta.notFound.title', statusCode: 404 },
};

const router = { resolve: (path) => ({ meta: ROUTE_META[path] ?? {} }) };

const contactRoute = {
  path: '/en/contact',
  name: 'Contact',
  meta: ROUTE_META['/en/contact'],
};

const options = (overrides = {}) => ({
  route: contactRoute,
  router,
  locale: 'en',
  t,
  theme: 'light',
  statusCode: 200,
  env: ENV,
  fontPreloadUrl: '/assets/inter-latin-wght-normal-abc.woff2',
  ...overrides,
});

describe('ssr/head.js', () => {
  it('builds the title without doubling the app name', () => {
    const head = generateHead(options());
    expect(head).toContain('<title>Contact Us — Acme</title>');

    const home = generateHead(
      options({ route: { path: '/en', name: 'Index', meta: ROUTE_META['/en'] } })
    );
    expect(home).toContain('<title>Acme</title>');
  });

  it('renders the analytics and captcha metas only when valid', () => {
    const head = generateHead(options());
    expect(head).toContain('<meta name="ga-id" content="G-ABC123">');
    expect(head).toContain('<meta name="recaptcha-site-key" content="site_key-1">');
    expect(head).not.toContain('<script>');

    const without = generateHead(
      options({
        env: { ...ENV, GA_MEASUREMENT_ID: '"><script>x</script>', RECAPTCHA_SITE_KEY: '' },
      })
    );
    expect(without).not.toContain('name="ga-id"');
    expect(without).not.toContain('name="recaptcha-site-key"');
  });

  it('exposes the site name for the client', () => {
    expect(generateHead(options())).toContain('<meta property="og:site_name" content="Acme">');
  });

  it('preloads the latin font', () => {
    expect(generateHead(options())).toContain(
      '<link rel="preload" as="font" type="font/woff2" href="/assets/inter-latin-wght-normal-abc.woff2" crossorigin>'
    );
    expect(generateHead(options({ fontPreloadUrl: '' }))).not.toContain('rel="preload"');
  });

  it('renders a single favicon set that exists in public', () => {
    const head = generateHead(options());

    expect(head.match(/rel="icon"/g)).toHaveLength(2);
    expect(head.match(/rel="apple-touch-icon"/g)).toHaveLength(1);
    expect(head).not.toContain('favicon.ico');
    expect(head).not.toContain('<meta charset');
  });

  it('emits hreflang alternates for every locale and x-default', () => {
    const head = generateHead(options());

    expect(head).toContain('<link rel="canonical" href="https://www.example.com/en/contact">');
    expect(head).toContain('hreflang="fr" href="https://www.example.com/fr/contact"');
    expect(head).toContain('hreflang="x-default" href="https://www.example.com/en/contact"');
  });

  it('drops canonical and alternates on a 404', () => {
    const head = generateHead(options({ statusCode: 404 }));

    expect(head).not.toContain('rel="canonical"');
    expect(head).not.toContain('hreflang');
  });

  it('builds breadcrumbs from page titles, not slugs', () => {
    const crumbs = buildBreadcrumbs({
      route: contactRoute,
      router,
      siteUrl: 'https://www.example.com',
      locale: 'en',
      t,
    });

    expect(crumbs).toEqual([
      { name: 'Home', url: 'https://www.example.com/en' },
      { name: 'Contact Us', url: 'https://www.example.com/en/contact' },
    ]);
  });

  it('skips breadcrumb segments that resolve to the 404 route', () => {
    const crumbs = buildBreadcrumbs({
      route: { path: '/en/missing', meta: {} },
      router,
      siteUrl: 'https://www.example.com',
      locale: 'en',
      t,
    });

    expect(crumbs).toHaveLength(1);
  });

  it('emits JSON-LD without a SearchAction and safe for script tags', () => {
    const home = generateHead(
      options({ route: { path: '/en', name: 'Index', meta: ROUTE_META['/en'] } })
    );
    expect(home).toContain('"@type":"WebSite"');
    expect(home).not.toContain('SearchAction');

    const evil = generateHead(options({ env: { ...ENV, APP_NAME: 'A</script><script>x' } }));
    const ldJson = evil.split('<script type="application/ld+json">').slice(1);
    for (const block of ldJson) {
      expect(block.split('</script>')[0]).not.toContain('<');
    }
  });

  it('adds no structured data on noindex pages', () => {
    const route = {
      path: '/en/signin',
      name: 'Signin',
      meta: { title: 'meta.signin.title', robots: 'noindex, follow' },
    };

    expect(generateHead(options({ route }))).not.toContain('application/ld+json');
  });

  it('builds the head context from the environment', () => {
    const ctx = buildHeadContext(options({ theme: 'dark' }));

    expect(ctx.siteUrl).toBe('https://www.example.com');
    expect(ctx.themeColor).toBe('#0a0a0a');
    expect(ctx.gaId).toBe('G-ABC123');
  });
});
