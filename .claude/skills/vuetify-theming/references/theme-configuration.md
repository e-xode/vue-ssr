# Theme configuration

## createVuetify theme shape

`src/plugins/vuetify.js` defines the two palettes as standalone objects (`colors`, `colorsDark`) and wires them into `createVuetify`:

```javascript
const colors = { primary: '#4f46e5', /* ...full palette... */ };
const colorsDark = { primary: '#818cf8', /* ...full palette... */ };

createVuetify({
  theme: {
    defaultTheme: theme,
    themes: {
      light: { dark: false, colors: colors },
      dark: { dark: true, colors: colorsDark },
    },
  },
});
```

Full hex values for both objects: `references/color-palette.md` (sibling file in this same folder).

## Switching themes at runtime

```vue
<script setup>
import { useTheme } from 'vuetify';

const theme = useTheme();

function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark';
}
</script>
```

## Reading a theme color in code

```vue
<script setup>
import { useTheme } from 'vuetify';

const theme = useTheme();
const primaryColor = theme.current.value.colors.primary;
</script>
```

Prefer the `color="primary"` prop on components over reading hex/theme values in script — reach for `useTheme()` only when you need the resolved value in JS (e.g. passing a color into a canvas/chart library).
