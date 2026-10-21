import { describe, it, expect, vi, beforeEach } from 'vitest';

const change = vi.fn();

vi.mock('vuetify', () => ({
  useTheme: () => ({ change }),
}));

import { useSystemTheme } from '@/composables/useSystemTheme';
import { hasThemeChoice, parseThemeCookie } from '@/shared/theme';

function mockColorScheme(prefersDark) {
  window.matchMedia = vi.fn().mockReturnValue({ matches: prefersDark });
}

function clearThemeCookie() {
  document.cookie = 'theme=; path=/; max-age=0';
}

describe('composables/useSystemTheme.js', () => {
  beforeEach(() => {
    change.mockClear();
    clearThemeCookie();
    document.documentElement.className = '';
  });

  it('switches to dark after mount when the OS prefers dark and no choice is stored', () => {
    mockColorScheme(true);
    const { applySystemPreference } = useSystemTheme();

    applySystemPreference();

    expect(change).toHaveBeenCalledWith('dark');
    expect(document.documentElement.classList.contains('v-theme--dark')).toBe(true);
  });

  it('keeps the default theme when the OS prefers light', () => {
    mockColorScheme(false);
    const { applySystemPreference } = useSystemTheme();

    applySystemPreference();

    expect(change).not.toHaveBeenCalled();
  });

  it('never overrides a stored theme choice', () => {
    mockColorScheme(true);
    document.cookie = 'theme=light; path=/';
    const { applySystemPreference } = useSystemTheme();

    applySystemPreference();

    expect(change).not.toHaveBeenCalled();
  });
});

describe('shared/theme.js choice detection', () => {
  it('detects a valid stored theme only', () => {
    expect(hasThemeChoice('theme=dark')).toBe(true);
    expect(hasThemeChoice('a=1; theme=light')).toBe(true);
    expect(hasThemeChoice('theme=purple')).toBe(false);
    expect(hasThemeChoice('')).toBe(false);
    expect(hasThemeChoice(undefined)).toBe(false);
  });

  it('keeps parsing the cookie with the light default', () => {
    expect(parseThemeCookie('theme=dark')).toBe('dark');
    expect(parseThemeCookie('theme=purple')).toBe('light');
    expect(parseThemeCookie('')).toBe('light');
  });
});
