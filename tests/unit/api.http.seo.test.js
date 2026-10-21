import { describe, it, expect, vi } from 'vitest';
import { buildRobotsTxt, setupSeoRoutes } from '#src/api/http/seo.js';

function createApp() {
  const routes = {};
  return { routes, get: vi.fn((path, handler) => (routes[path] = handler)) };
}

function createResponse() {
  const res = {};
  res.set = vi.fn(() => res);
  res.send = vi.fn(() => res);
  res.status = vi.fn(() => res);
  res.end = vi.fn(() => res);
  return res;
}

describe('api/http/seo.js', () => {
  it('builds robots.txt with the sitemap url and private paths', () => {
    const robots = buildRobotsTxt('https://www.example.com');

    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Disallow: /api/');
    expect(robots).toContain('Disallow: /*/admin/');
    expect(robots).toContain('Sitemap: https://www.example.com/sitemap.xml');
  });

  it('serves robots.txt with a one day cache', () => {
    const app = createApp();
    setupSeoRoutes(app, { db: null, siteUrl: 'https://www.example.com' });
    const res = createResponse();

    app.routes['/robots.txt']({}, res);

    expect(res.set).toHaveBeenCalledWith(
      expect.objectContaining({ 'Cache-Control': 'public, max-age=86400' })
    );
    expect(res.send).toHaveBeenCalledWith(expect.stringContaining('Sitemap:'));
  });

  it('serves the sitemap xml with cache headers', async () => {
    const app = createApp();
    setupSeoRoutes(app, { db: null, siteUrl: 'https://www.example.com' });
    const res = createResponse();

    await app.routes['/sitemap.xml']({}, res);

    expect(res.set).toHaveBeenCalledWith(
      expect.objectContaining({ 'Cache-Control': 'public, max-age=3600' })
    );
    expect(res.send).toHaveBeenCalledWith(expect.stringContaining('<urlset'));
  });
});
