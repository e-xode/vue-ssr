---
name: design-scss
description: "SCSS design-system reference for the Vue SSR Starter Kit: design tokens (spacing, radius, shadows, transitions, breakpoints in variables.scss), 11 mixins (flex-center, flex-between, flex-col, truncate, multiline-truncate, absolute-center, transition, hover-lift, button-reset, visually-hidden, respond-to), the auto-injection barrel (_inject.scss via Vite: variables/typography/mixins only), component-scoped SCSS conventions, and the inert _animations.scss/_utilities.scss partials (present but NOT bundled; classes render nothing). Trigger on ANY styling work: writing SCSS, choosing tokens, animations, component .scss files, Vuetify style overrides, layout utilities, or design-system questions. This is the token/mixin reference — the design agent loads this skill to produce SCSS. Don't use for: app architecture (→ vue-ssr-architecture), auth (→ vue-ssr-auth), Docker/CI (→ vue-ssr-deployment), validation (→ vue-ssr-hooks), Vuetify component API (→ vuetify-components), design delegation routing (→ vue-ssr-design)."
---

# Design SCSS

> Owns the SCSS design system: tokens, mixins, animations, utilities, component-scoped patterns, and responsive strategy.

## Architecture overview

```
src/styles/
├── variables.scss        # Design tokens (spacing, radius, shadow, transition, breakpoint)
├── _typography.scss      # Base typography (injected)
├── mixins.scss           # 11 reusable mixins
├── _inject.scss          # Barrel: @forward 'variables'; @forward 'typography'; @forward 'mixins'
├── _animations.scss      # Keyframes + classes + stagger delays — NOT in the chain (inert; see note)
└── _utilities.scss       # Glass, badges, gradients, hover, skeleton, sr-only — NOT in the chain (inert; see note)
```

**Auto-injection:** `_inject.scss` is injected into every component SCSS via Vite's `css.preprocessorOptions.scss.additionalData` (`@use ".../styles/inject" as *`). It forwards **only** `variables`, `typography`, and `mixins` — these are available everywhere without explicit `@use`.

> **Reachability — `_animations.scss` and `_utilities.scss` are NOT live.** They are neither forwarded by `_inject.scss` nor imported anywhere (no `global.scss`, no `main.js` import). Their classes (`.animate-*`, `.delay-*`, `.glass`, `.text-gradient-*`, `.hover-lift`, `.hover-scale`, `.badge-*`, `.skeleton`, `.sr-only`) therefore emit **no CSS** and cannot be used from templates as shipped. There is also **no global `prefers-reduced-motion` handler**. To use these effects: build them from the live tokens/mixins in a component SCSS (and self-guard motion with `@media (prefers-reduced-motion: reduce)`), or wire the partials in once via a global import in `main.js` if you want them project-wide.

**Component-scoped files:** Every Vue component that needs styles has a dedicated `.scss` file:

```html
<style lang="scss" scoped src="./MyComponent.scss"></style>
```

## Token system (variables.scss)

| Category      | Tokens                                                                 | Base                  |
| ------------- | ---------------------------------------------------------------------- | --------------------- |
| Spacing       | xs (4px), sm (8px), md (16px), lg (24px), xl (32px), 2xl (48px)        | $spacing-unit: 8px    |
| Border-radius | sm (4px), md (8px), lg (12px), xl (16px)                               | —                     |
| Shadows       | sm, md, lg, xl                                                         | rgba-based box-shadow |
| Transitions   | fast (150ms), base (300ms), slow (500ms)                               | —                     |
| Breakpoints   | xs (0), sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px) | Mobile-first          |

**Rule:** Never hardcode colors, spacings, or font sizes. Always use tokens.

## Mixins quick-reference

| Mixin                              | Purpose                                    |
| ---------------------------------- | ------------------------------------------ |
| `flex-center`                      | Flex + center both axes                    |
| `flex-between`                     | Flex + space-between + center              |
| `flex-col`                         | Flex column                                |
| `truncate`                         | Single-line text ellipsis                  |
| `multiline-truncate($lines)`       | Multi-line clamp                           |
| `absolute-center`                  | Absolute + translate centering             |
| `transition($prop, $dur, $timing)` | Custom transition shorthand                |
| `hover-lift`                       | Hover: translateY(-4px) + shadow           |
| `button-reset`                     | Strip browser button defaults              |
| `visually-hidden`                  | Accessible hide (screen readers)           |
| `respond-to($bp)`                  | Mobile-first media query (sm/md/lg/xl/2xl) |

Usage (no `@use` needed, auto-injected):

```scss
.card {
  @include flex-col;
  padding: $spacing-md;
  border-radius: $border-radius-lg;
  @include transition(opacity, $transition-fast);

  @include respond-to('lg') {
    padding: $spacing-xl;
  }
}
```

## Component-scoped SCSS convention

1. File lives next to its `.vue` file: `src/views/Auth/SigninView.scss`
2. Component references it: `<style lang="scss" scoped src="./SigninView.scss"></style>`
3. All selectors are scoped (Vue adds `[data-v-xxx]`)
4. No code comments in `.scss` files
5. Use tokens and mixins exclusively — no magic numbers

## Responsive design

Mobile-first approach using `respond-to()` mixin:

```scss
.hero {
  padding: $spacing-md;

  @include respond-to('md') {
    padding: $spacing-lg;
  }

  @include respond-to('xl') {
    padding: $spacing-2xl;
  }
}
```

Breakpoint progression: base (mobile) → sm (640) → md (768) → lg (1024) → xl (1280) → 2xl (1536).

## Animations

`_animations.scss` defines keyframes (fadeIn, fadeUp, fadeDown, scaleIn, reveal, slideLeft, slideRight, float, pulse, shimmer, glow, rotate), `.animate-*` classes, `.delay-1`..`.delay-8` stagger, and a `prefers-reduced-motion` block — but the file is **not in the injection chain and is imported nowhere**, so none of it renders. Treat the catalog in [references/animations-reference.md](references/animations-reference.md) as patterns to reproduce in a component SCSS, not as ready-to-use classes. Any motion you add must carry its **own** `@media (prefers-reduced-motion: reduce)` guard — there is no global one. To make the catalog live project-wide, import `_animations.scss` once in `main.js`.

## Utility classes

`_utilities.scss` defines `.text-gradient-*`, `.hover-lift` / `.hover-scale`, `.glass` / `.glass-dark`, `.badge-*`, `.sr-only`, and `.skeleton` — but, like `_animations.scss`, the file is **not bundled**, so these classes emit no CSS. Use the live equivalents instead: the `hover-lift` **mixin** (not the `.hover-lift` class), the `visually-hidden` **mixin** (not the `.sr-only` class), and tokens for everything else. See [references/utilities-reference.md](references/utilities-reference.md) for what the file contains and how to reproduce each helper.

## Hard rules

1. SCSS externalized — never inline `<style>` blocks without `src`
2. No hardcoded colors, spacings, font sizes — use variables
3. No code comments in `.scss` files
4. Composition over duplication — use mixins
5. Mobile-first responsive — smallest screen as base

## References

| File                                                          | Content                             |
| ------------------------------------------------------------- | ----------------------------------- |
| [variables-reference.md](references/variables-reference.md)   | Complete token inventory            |
| [mixins-reference.md](references/mixins-reference.md)         | All 11 mixins with examples         |
| [animations-reference.md](references/animations-reference.md) | Keyframes, classes, stagger, a11y — inert (not bundled) |
| [utilities-reference.md](references/utilities-reference.md)   | Glass, badges, gradients, skeleton — inert (not bundled) |
| [scss-patterns.md](references/scss-patterns.md)               | File naming, @use/@forward, nesting |
