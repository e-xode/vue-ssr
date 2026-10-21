import { describe, it, expect } from 'vitest';
import { buildTitle } from '@/shared/title';

describe('shared/title.js', () => {
  it('appends the app name to a page title', () => {
    expect(buildTitle('Contact', 'App')).toBe('Contact — App');
  });

  it('does not repeat the app name when the page title already has it', () => {
    expect(buildTitle('App — Starter Kit', 'App')).toBe('App — Starter Kit');
  });

  it('falls back to the app name when there is no page title', () => {
    expect(buildTitle('', 'App')).toBe('App');
    expect(buildTitle(undefined, 'App')).toBe('App');
  });

  it('returns the page title alone when there is no app name', () => {
    expect(buildTitle('Contact', '')).toBe('Contact');
  });
});
