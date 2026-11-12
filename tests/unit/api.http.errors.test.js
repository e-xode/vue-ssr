import { describe, it, expect, vi } from 'vitest';
import {
  apiErrorHandler,
  apiNotFoundHandler,
  createForbiddenOriginError,
  ensureRequestBody,
} from '#src/api/http/errors.js';
import { createRes } from '../fixtures/routeHarness.js';

function handle(err, originalUrl, res = createRes()) {
  const next = vi.fn();
  apiErrorHandler(err, { originalUrl }, res, next);
  return { res, next };
}

describe('api/http/errors.js request helpers', () => {
  it('gives a request without a parsed body an empty object', () => {
    const req = {};
    const next = vi.fn();

    ensureRequestBody(req, {}, next);

    expect(req.body).toEqual({});
    expect(next).toHaveBeenCalled();
  });

  it('keeps a parsed body untouched', () => {
    const body = { email: 'user@example.com' };
    const req = { body };

    ensureRequestBody(req, {}, vi.fn());

    expect(req.body).toBe(body);
  });

  it('answers an unknown API path with a JSON 404', () => {
    const res = createRes();

    apiNotFoundHandler({}, res);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'error.notFound' });
  });
});

describe('api/http/errors.js', () => {
  it('answers a malformed JSON body with a 400 JSON error', () => {
    const err = Object.assign(new SyntaxError('Unexpected token'), { status: 400 });

    const { res, next } = handle(err, '/api/auth/signin');

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'error.validation' });
    expect(next).not.toHaveBeenCalled();
  });

  it('answers a refused CORS origin with 403', () => {
    const { res } = handle(createForbiddenOriginError(), '/api/contact');

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: 'error.forbidden' });
  });

  it('answers an unexpected error with 500 and logs it', () => {
    const err = new Error('boom');

    const { res } = handle(err, '/api/admin/users?page=1');

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'error.server' });
    expect(console.error).toHaveBeenCalledWith(err);
  });

  it('ignores an out-of-range status', () => {
    const { res } = handle(Object.assign(new Error('odd'), { status: 200 }), '/api/auth/me');

    expect(res.statusCode).toBe(500);
  });

  it('leaves page errors to the next handler', () => {
    const err = createForbiddenOriginError();

    const { res, next } = handle(err, '/en/contact');

    expect(next).toHaveBeenCalledWith(err);
    expect(res.body).toBeUndefined();
  });

  it('leaves the error alone once the response has started', () => {
    const err = new Error('late');
    const res = Object.assign(createRes(), { headersSent: true });

    const { next } = handle(err, '/api/auth/me', res);

    expect(next).toHaveBeenCalledWith(err);
    expect(res.body).toBeUndefined();
  });
});
