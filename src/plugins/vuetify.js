import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

const colors = {
  primary: '#2563eb',
  'primary-darken-1': '#1e40af',
  'primary-darken-2': '#1e3a8a',
  'primary-lighten-1': '#60a5fa',
  'primary-lighten-2': '#93c5fd',

  secondary: '#7c3aed',
  'secondary-darken-1': '#6d28d9',
  'secondary-darken-2': '#5b21b6',
  'secondary-lighten-1': '#a78bfa',
  'secondary-lighten-2': '#c4b5fd',

  accent: '#06b6d4',

  success: '#00c853',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',

  surface: '#ffffff',
  background: '#f8fafc',
  'on-surface': '#0f172a',
  'on-background': '#0f172a',
}

const colorsDark = {
  ...colors,
  surface: '#1e293b',
  background: '#0f172a',
  'on-surface': '#f8fafc',
  'on-background': '#f8fafc',
}

export function createApplicationVuetify(ssr = false) {
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
      defaultTheme: 'light',
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
      VBtn: {
        variant: 'flat',
        rounded: 'lg',
      },
      VCard: {
        rounded: 'xl',
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
    }
  })
}
