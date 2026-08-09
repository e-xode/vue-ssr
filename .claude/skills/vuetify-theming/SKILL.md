---
name: vuetify-theming
description: "Vuetify 4 theming for the Vue SSR Starter Kit: theme configuration (light/dark themes), theme tokens and CSS custom properties, dark-mode switching, per-component defaults via the defaults object, and Vuetify CSS utility classes. Trigger on: configuring or switching themes, dark mode, defining theme colors, the defaults provider, or Vuetify utility classes. Don't use for: choosing a color token by name or general component selection (→ vuetify-overview), SCSS design tokens/variables.scss (→ design-scss), component APIs (→ vuetify-components/forms/data/layout), icons (→ vuetify-icons)."
---

# Theming

## Division of responsibilities

| Skill               | Owns                                                                 |
| -------------------- | --------------------------------------------------------------------- |
| **vuetify-theming**  | The hex value behind every color token — the single source of truth  |
| `vuetify-overview`   | Which semantic token name to use in a given component (points here for the actual hex) |

`src/plugins/vuetify.js` (and, for SCSS-level tokens, `src/styles/variables.scss`) are the only places
a hex value is **defined**. This skill's `references/color-palette.md` is the canonical **documentation
mirror** of that code. Other skills (`design-ux`, `brand-art-direction`) may legitimately quote a hex
value inline for readability — that is a mirror, not a competing source — but if a value there ever
disagrees with the code, the code wins and the doc is stale. Components always use semantic names
(`color="primary"`), never raw hex.

## Project defaults (createVuetify defaults object)

| Component    | Defaults                                              |
| ------------ | ------------------------------------------------------ |
| `VAppBar`    | flat: true                                              |
| `VBtn`       | variant: flat, rounded: lg                              |
| `VCard`      | rounded: lg, elevation: 0, border: true                 |
| `VTextField` | variant: outlined, density: comfortable, rounded: lg     |
| `VSelect`    | variant: outlined, density: comfortable, rounded: lg     |
| `VSwitch`    | color: primary, inset: true                              |
| `VChip`      | rounded: lg                                              |
| `VAlert`     | rounded: lg, variant: tonal                              |
| `VTooltip`   | location: bottom                                         |

Override per-instance by explicitly setting the prop: `<v-btn variant="outlined">`, `<v-card :elevation="2" :border="false">`.

## Hard rules

- **Never hardcode hex in a component** — reference the semantic token name (`color="primary"`). `src/plugins/vuetify.js` is the code source of truth; `references/color-palette.md` mirrors it for reading.
- **`VCard`'s project default is `rounded: 'lg'`**, not `'xl'` — verify against `src/plugins/vuetify.js` before repeating it anywhere.
- **The dark theme is a fully independent palette**, not an override of light-theme surfaces. `colorsDark` in `src/plugins/vuetify.js` redefines every token — brand colors (`primary`, `secondary`, `accent`) and feedback colors (`success`/`warning`/`error`/`info`) all shift to lighter, dark-background-appropriate values, in addition to surface/background. See `references/color-palette.md`.

## Reference files

| Need                                                          | File                                  |
| -------------------------------------------------------------- | --------------------------------------- |
| Full light + dark hex tables (single source of truth)          | `references/color-palette.md`           |
| `createVuetify({ theme })` config shape                         | `references/theme-configuration.md`     |
| Switching themes at runtime, reading a theme color in code      | `references/theme-configuration.md`     |
| Vuetify CSS utility classes (spacing, flex, typography, color)  | `references/utility-classes.md`         |
| SSR-safe instantiation (`createApplicationVuetify`)             | `references/ssr-instantiation.md`       |
