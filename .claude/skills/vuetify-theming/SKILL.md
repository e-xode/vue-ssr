---
name: vuetify-theming
description: "Vuetify 4 theming for the Vue SSR Starter Kit: theme configuration (light/dark themes), theme tokens and CSS custom properties, dark-mode switching, per-component defaults via the defaults object, and Vuetify CSS utility classes. Trigger on: configuring or switching themes, dark mode, defining theme colors, the defaults provider, or Vuetify utility classes. Don't use for: choosing a color token by name or general component selection (→ vuetify-overview), SCSS design tokens/variables.scss (→ design-scss), component APIs (→ vuetify-components/forms/data/layout), icons (→ vuetify-icons)."
---

# Theming

## createVuetify theme configuration

The project defines themes in `src/plugins/vuetify.js`:

```javascript
theme: {
  defaultTheme: 'light',
  themes: {
    light: {
      dark: false,
      colors: {
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
        'on-background': '#0f172a'
      }
    },
    dark: {
      dark: true,
      colors: {
        surface: '#1e293b',
        background: '#0f172a',
        'on-surface': '#f1f5f9',
        'on-background': '#f1f5f9'
      }
    }
  }
}
```

## Project color palette

| Category           | Token                 | Hex               | Usage                         |
| ------------------ | --------------------- | ----------------- | ----------------------------- |
| Primary (blue)     | `primary`             | #2563eb           | Buttons, links, active states |
|                    | `primary-darken-1`    | #1e40af           | Hover                         |
|                    | `primary-darken-2`    | #1e3a8a           | Active/pressed                |
|                    | `primary-lighten-1`   | #60a5fa           | Subtle backgrounds            |
|                    | `primary-lighten-2`   | #93c5fd           | Very subtle backgrounds       |
| Secondary (purple) | `secondary`           | #7c3aed           | Secondary actions             |
|                    | `secondary-darken-1`  | #6d28d9           | Hover                         |
|                    | `secondary-darken-2`  | #5b21b6           | Active/pressed                |
|                    | `secondary-lighten-1` | #a78bfa           | Subtle                        |
|                    | `secondary-lighten-2` | #c4b5fd           | Very subtle                   |
| Accent (cyan)      | `accent`              | #06b6d4           | Highlights                    |
| Semantic           | `success`             | #00c853           | Success feedback              |
|                    | `warning`             | #ff9800           | Warning feedback              |
|                    | `error`               | #f44336           | Errors, destructive           |
|                    | `info`                | #2196f3           | Informational                 |
| Surface            | `surface`             | #ffffff / #1e293b | Cards, sheets                 |
|                    | `background`          | #f8fafc / #0f172a | Page background               |

## Dark mode

The dark theme inherits all color tokens from light and overrides only surface colors. Use the theme system for dark mode support:

```vue
<script setup>
import { useTheme } from 'vuetify';

const theme = useTheme();

function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark';
}
</script>
```

### Accessing theme colors in code

```vue
<script setup>
import { useTheme } from 'vuetify';

const theme = useTheme();
const primaryColor = theme.current.value.colors.primary;
</script>
```

## Component defaults

Global defaults are defined in `createVuetify({ defaults: {...} })`. They apply to every instance of a component unless overridden per-instance.

### Project defaults summary

| Component    | Defaults                                             |
| ------------ | ---------------------------------------------------- |
| `VBtn`       | variant: flat, rounded: lg                           |
| `VCard`      | rounded: xl, elevation: 0, border: true              |
| `VTextField` | variant: outlined, density: comfortable, rounded: lg |
| `VSelect`    | variant: outlined, density: comfortable, rounded: lg |
| `VSwitch`    | color: primary, inset: true                          |
| `VChip`      | rounded: lg                                          |
| `VAlert`     | rounded: lg, variant: tonal                          |
| `VTooltip`   | location: bottom                                     |

### Overriding per-instance

Explicitly set a prop to override the default:

```vue
<v-btn variant="outlined">Outlined button</v-btn>
<v-card :elevation="2" :border="false">Elevated card</v-card>
<v-text-field variant="solo" density="compact" />
```

## Vuetify CSS utility classes

Vuetify provides utility classes similar to Tailwind but using Material Design spacing scale.

### Display and flex

```
d-flex, d-inline-flex, d-block, d-inline-block, d-none
flex-row, flex-column, flex-wrap
justify-start, justify-center, justify-end, justify-space-between, justify-space-around
align-start, align-center, align-end, align-stretch
```

### Spacing (margin and padding)

Pattern: `{property}{direction}-{size}`

Properties: `m` (margin), `p` (padding)
Directions: `t` (top), `b` (bottom), `l` (left), `r` (right), `s` (start), `e` (end), `x` (horizontal), `y` (vertical), `a` (all)
Sizes: `0` through `16` (multiples of 4px), `auto`

```
ma-4    -> margin: 16px (all)
px-2    -> padding-left: 8px; padding-right: 8px
mt-6    -> margin-top: 24px
mb-0    -> margin-bottom: 0
```

### Typography

```
text-h1 through text-h6
text-subtitle-1, text-subtitle-2
text-body-1, text-body-2
text-caption, text-overline
font-weight-bold, font-weight-medium, font-weight-light
text-center, text-start, text-end
```

### Colors (text and background)

```
text-primary, text-error, text-success
bg-primary, bg-surface, bg-background
```

### Responsive display

```
d-none d-md-flex       -> hidden below md, flex from md up
d-flex d-md-none       -> flex below md, hidden from md up
```

## SSR: createApplicationVuetify

The factory function accepts an `ssr` boolean:

```javascript
import { createApplicationVuetify } from '@/plugins/vuetify';
```

Server-side (`entry-server.js`):

```javascript
const vuetify = createApplicationVuetify(true);
app.use(vuetify);
```

Client-side (`entry-client.js`):

```javascript
const vuetify = createApplicationVuetify(false);
app.use(vuetify);
```

The SSR flag:

- Disables transitions during server render
- Prevents client-only API access (window, document)
- Ensures proper hydration matching between server and client output
