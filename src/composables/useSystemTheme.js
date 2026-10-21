import { useTheme } from 'vuetify';
import { DARK_SCHEME_QUERY, applyDocumentTheme, hasThemeChoice } from '@/shared/theme';

export function useSystemTheme() {
  const theme = useTheme();

  function applySystemPreference() {
    if (typeof window === 'undefined') return;
    if (hasThemeChoice(document.cookie)) return;
    if (!window.matchMedia(DARK_SCHEME_QUERY).matches) return;
    theme.change('dark');
    applyDocumentTheme('dark');
  }

  return { applySystemPreference };
}
