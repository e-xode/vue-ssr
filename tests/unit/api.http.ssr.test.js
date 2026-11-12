import { describe, it, expect, vi } from 'vitest';
import { createSsrRenderer } from '#src/api/http/ssr.js';

function buildVite(render) {
  return {
    transformIndexHtml: vi.fn(async (url, html) => html),
    ssrLoadModule: vi.fn(async () => ({ render })),
    ssrFixStacktrace: vi.fn(),
  };
}

function buildRes() {
  const res = { statusCode: null, headers: null, body: null };
  res.redirect = vi.fn();
  res.status = vi.fn((code) => {
    res.statusCode = code;
    return res;
  });
  res.set = vi.fn((headers) => {
    res.headers = headers;
    return res;
  });
  res.send = vi.fn((body) => {
    res.body = body;
    return res;
  });
  res.end = res.send;
  return res;
}

function buildRenderer(render, base = '/') {
  const vite = buildVite(render);
  return createSsrRenderer({ isProduction: false, vite, templateHtml: '', base, db: {} });
}

const page = { html: '<main>ok</main>', head: '<title>t</title>', locale: 'en', state: null };

describe('api/http/ssr.js', () => {
  it('redirects when the router resolved the URL to another route', async () => {
    const render = vi.fn().mockResolvedValue({ redirect: '/en/admin/users' });
    const res = buildRes();

    await buildRenderer(render).handle({ originalUrl: '/en/admin', headers: {} }, res);

    expect(res.redirect).toHaveBeenCalledWith(302, '/en/admin/users');
    expect(res.send).not.toHaveBeenCalled();
  });

  it('keeps the public base path in the redirect target', async () => {
    const render = vi.fn().mockResolvedValue({ redirect: '/en/admin/users' });
    const res = buildRes();

    await buildRenderer(render, '/app/').handle({ originalUrl: '/app/en/admin', headers: {} }, res);

    expect(res.redirect).toHaveBeenCalledWith(302, '/app/en/admin/users');
  });

  it('renders the page with the status the render reports', async () => {
    const render = vi.fn().mockResolvedValue({ ...page, statusCode: 410 });
    const res = buildRes();

    await buildRenderer(render).handle({ originalUrl: '/en/gone', headers: {} }, res);

    expect(res.redirect).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(410);
    expect(res.body).toContain('<main>ok</main>');
  });
});
