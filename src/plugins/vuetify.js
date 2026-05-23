import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';

const colors = {
  primary: '#4f46e5',
  'primary-darken-1': '#4338ca',
  'primary-darken-2': '#3730a3',
  'primary-lighten-1': '#818cf8',
  'primary-lighten-2': '#c7d2fe',

  secondary: '#525252',
  'secondary-darken-1': '#404040',
  'secondary-lighten-1': '#737373',

  accent: '#4f46e5',

  success: '#16a34a',
  warning: '#d97706',
  error: '#dc2626',
  info: '#4f46e5',

  'on-primary': '#ffffff',

  background: '#fafafa',
  surface: '#ffffff',
  'surface-variant': '#f5f5f5',
  'on-surface-variant': '#525252',
  'on-surface': '#171717',
  'on-background': '#171717',
  outline: '#e5e5e5',
  'outline-variant': '#f0f0f0',
};

const colorsDark = {
  primary: '#818cf8',
  'primary-darken-1': '#6366f1',
  'primary-darken-2': '#4f46e5',
  'primary-lighten-1': '#a5b4fc',
  'primary-lighten-2': '#c7d2fe',

  secondary: '#a3a3a3',
  'secondary-darken-1': '#737373',
  'secondary-lighten-1': '#d4d4d4',

  accent: '#818cf8',

  success: '#22c55e',
  warning: '#f59e0b',
  error: '#f87171',
  info: '#818cf8',

  'on-primary': '#ffffff',

  background: '#0a0a0a',
  surface: '#171717',
  'surface-variant': '#262626',
  'on-surface-variant': '#a3a3a3',
  'on-surface': '#fafafa',
  'on-background': '#fafafa',
  outline: '#404040',
  'outline-variant': '#262626',
};

export function createApplicationVuetify(ssr = false, theme = 'light') {
  return createVuetify({
    components,
    directives,
    ssr,
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: { mdi },
    },
    theme: {
      defaultTheme: theme,
      themes: {
        light: {
          dark: false,
          colors: colors,
        },
        dark: {
          dark: true,
          colors: colorsDark,
        },
      },
    },
    defaults: {
      VAppBar: {
        flat: true,
      },
      VBtn: {
        variant: 'flat',
        rounded: 'lg',
      },
      VCard: {
        rounded: 'lg',
        elevation: 0,
        border: true,
      },
      VTextField: {
        variant: 'outlined',
        density: 'comfortable',
        rounded: 'lg',
      },
      VSelect: {
        variant: 'outlined',
        density: 'comfortable',
        rounded: 'lg',
      },
      VSwitch: {
        color: 'primary',
        inset: true,
      },
      VChip: {
        rounded: 'lg',
      },
      VAlert: {
        rounded: 'lg',
        variant: 'tonal',
      },
      VTooltip: {
        location: 'bottom',
      },
    },
  });
}
