import { describe, it, expect, vi } from 'vitest';
import { AVATAR_MAX_BYTES, AVATAR_MIME_EXTENSIONS } from '#src/shared/const.js';
import { createRes } from '../fixtures/routeHarness.js';

const multerState = vi.hoisted(() => ({ options: null, nextError: null }));

vi.mock('multer', () => {
  const multer = (options) => {
    multerState.options = options;
    return { single: () => (req, res, cb) => cb(multerState.nextError) };
  };
  multer.diskStorage = (config) => config;
  return { default: multer };
});

vi.mock('node:fs', async (importOriginal) => {
  const original = await importOriginal();
  return { ...original, default: { ...original.default, mkdirSync: () => undefined } };
});

const { uploadAvatar } = await import('#src/api/auth/avatar.js');

function runUpload(error) {
  multerState.nextError = error;
  const res = createRes();
  const next = vi.fn();
  uploadAvatar({}, res, next);
  return { res, next };
}

describe('api/auth/avatar.js', () => {
  it('limits the upload to one file of the configured size', () => {
    expect(multerState.options.limits).toEqual({ fileSize: AVATAR_MAX_BYTES, files: 1 });
  });

  it('derives the stored extension from the MIME type, not the original name', () => {
    const { storage } = multerState.options;
    const cb = vi.fn();

    storage.filename({}, { mimetype: 'image/png', originalname: 'evil.html' }, cb);

    expect(cb.mock.calls[0][1]).toMatch(/^[0-9a-f-]{36}\.png$/);
    expect(Object.keys(AVATAR_MIME_EXTENSIONS)).toContain('image/png');
  });

  it('rejects MIME types that are not in the map, including prototype keys', () => {
    const { fileFilter } = multerState.options;
    const cb = vi.fn();

    fileFilter({}, { mimetype: 'constructor' }, cb);

    expect(cb.mock.calls[0][0].code).toBe('LIMIT_UNEXPECTED_TYPE');
  });

  it('accepts an allowed MIME type', () => {
    const { fileFilter } = multerState.options;
    const cb = vi.fn();

    fileFilter({}, { mimetype: 'image/webp' }, cb);

    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it('continues to the handler when multer reports no error', () => {
    const { next } = runUpload(null);

    expect(next).toHaveBeenCalled();
  });

  it('answers 413 for an oversize file', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { res, next } = runUpload({ code: 'LIMIT_FILE_SIZE' });

    expect(res.statusCode).toBe(413);
    expect(res.body).toEqual({ error: 'error.avatar.tooLarge' });
    expect(next).not.toHaveBeenCalled();
  });

  it('answers 415 for a wrong file type', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { res } = runUpload({ code: 'LIMIT_UNEXPECTED_TYPE' });

    expect(res.statusCode).toBe(415);
    expect(res.body).toEqual({ error: 'error.avatar.invalidType' });
  });

  it('answers 500 with the generic key for any other upload error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { res } = runUpload(new Error('disk full'));

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'error.server' });
  });
});
