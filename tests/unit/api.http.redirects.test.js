import { describe, it, expect, vi } from 'vitest';
import {
  pickLocaleFromHeader,
  redirectMiddleware,
  resolveRedirect,
} from '#src/api/http/redirects.js';

const get = (url, acceptLanguage) => resolveRedirect({ method: 'GET', url, acceptLanguage });

describe('api/http/redirects.js', () => {
  describe('pickLocaleFromHeader', () => {
    it('defaults to en without a usable header', () => {
      expect(pickLocaleFromHeader(undefined)).toBe('en');
      expect(pickLocaleFromHeader('de-DE,de;q=0.9')).toBe('en');
    });

    it('picks the best supported language by quality', () => {
      expect(pickLocaleFromHeader('fr-FR,fr;q=0.9,en;q=0.8')).toBe('fr');
      expect(pickLocaleFromHeader('en;q=0.4, fr;q=0.8')).toBe('fr');
      expect(pickLocaleFromHeader('fr;q=0, en')).toBe('en');
    });
  });

  describe('resolveRedirect', () => {
    it('redirects the root to the negotiated locale with a 302 and keeps the query', () => {
      expect(get('/', 'fr-FR,fr;q=0.9')).toEqual({
        status: 302,
        location: '/fr',
        varyAcceptLanguage: true,
      });
      expect(get('/?utm=1', undefined).location).toBe('/en?utm=1');
    });

    it('redirects a trailing slash with a 301 and keeps the query', () => {
      expect(get('/en/contact/?a=1')).toEqual({ status: 301, location: '/en/contact?a=1' });
      expect(get('/fr/')).toEqual({ status: 301, location: '/fr' });
    });

    it('adds the locale prefix to a bare known page', () => {
      expect(get('/contact')).toEqual({ status: 301, location: '/en/contact' });
      expect(get('/contact/?x=1')).toEqual({ status: 301, location: '/en/contact?x=1' });
    });

    it('leaves canonical and unknown paths alone', () => {
      expect(get('/en')).toBeNull();
      expect(get('/fr/contact')).toBeNull();
      expect(get('/en/signin')).toBeNull();
      expect(get('/unknown')).toBeNull();
    });

    it('ignores non GET/HEAD methods', () => {
      expect(resolveRedirect({ method: 'POST', url: '/' })).toBeNull();
      expect(resolveRedirect({ method: 'HEAD', url: '/' }).status).toBe(302);
    });

    it('skips api, assets and files with an extension', () => {
      expect(get('/api/auth/me/')).toBeNull();
      expect(get('/assets/app-abc.js')).toBeNull();
      expect(get('/robots.txt')).toBeNull();
      expect(get('/uploads/avatars/x.png')).toBeNull();
    });

    it('never produces a protocol-relative or backslash location', () => {
      expect(get('//evil.example/')).toBeNull();
      expect(get('//evil.example/contact')).toBeNull();
      expect(get('/\\evil.example/')).toBeNull();
      expect(get('/en//')).toEqual({ status: 301, location: '/en' });
    });
  });

  describe('redirectMiddleware', () => {
    it('sends the redirect and sets Vary for the root', () => {
      const res = { vary: vi.fn(), redirect: vi.fn() };
      const next = vi.fn();
      const req = { method: 'GET', originalUrl: '/', headers: { 'accept-language': 'fr' } };

      redirectMiddleware(req, res, next);

      expect(res.vary).toHaveBeenCalledWith('Accept-Language');
      expect(res.redirect).toHaveBeenCalledWith(302, '/fr');
      expect(next).not.toHaveBeenCalled();
    });

    it('calls next when nothing applies', () => {
      const res = { vary: vi.fn(), redirect: vi.fn() };
      const next = vi.fn();
      const req = { method: 'GET', originalUrl: '/en', headers: {} };

      redirectMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });
});
