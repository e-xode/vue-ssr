---
name: design-scss
description: "SCSS design-system reference for the Vue SSR Starter Kit: design tokens (spacing, radius, shadows, transitions, breakpoints in variables.scss), 11 mixins (flex-center, flex-between, flex-col, truncate, multiline-truncate, absolute-center, transition, hover-lift, button-reset, visually-hidden, respond-to), animations (_animations.scss), utilities (_utilities.scss: glass, badges, gradients, skeleton), auto-injection barrel (_inject.scss via Vite), and component-scoped SCSS conventions. Trigger on ANY styling work: writing SCSS, choosing tokens, animations, component .scss files, Vuetify style overrides, layout utilities, or design-system questions. This is the token/mixin reference — the design agent loads this skill to produce SCSS. Don't use for: app architecture (→ vue-ssr-architecture), auth (→ vue-ssr-auth), Docker/CI (→ vue-ssr-deployment), validation (→ vue-ssr-hooks), Vuetify component API (→ vuetify-components), design delegation routing (→ vue-ssr-design)."
---

# Design SCSS

> Owns the SCSS design system: tokens, mixins, animations, utilities, component-scoped patterns, and responsive strategy.

## Architecture overview

```
src/styles/
├── variables.scss        # Design tokens (spacing, radius, shadow, transition, breakpoint)
├── mixins.scss           # 11 reusable mixins
├── _inject.scss          # Barrel: @forward 'variables'; @forward 'mixins' (auto-injected)
├── _animations.scss      # Keyframes + animation utility classes + stagger delays
└── _utilities.scss       # Glass, badges, gradients, hover, skeleton, sr-only
```

**Auto-injection:** `_inject.scss` is injected into every component SCSS via Vite's `css.preprocessorOptions.scss.additionalData`. Variables and mixins are available everywhere without explicit `@use`.

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

Global keyframes and utility classes from `_animations.scss`:

- Apply via class: `class="animate-fade-up delay-2"`
- 12 keyframes available (fadeIn, fadeUp, fadeDown, scaleIn, reveal, slideLeft, slideRight, float, pulse, shimmer, glow, rotate)
- Stagger with `.delay-1` through `.delay-8` (100ms increments)
- `prefers-reduced-motion: reduce` automatically disables all animations

## Utility classes

From `_utilities.scss`:

- **Text gradients:** `.text-gradient-primary`, `.text-gradient-secondary`, `.text-gradient-accent`
- **Hover effects:** `.hover-lift`, `.hover-scale`
- **Glass:** `.glass`, `.glass-dark`
- **Badges:** `.badge-primary`, `.badge-success`, `.badge-warning`, `.badge-error`, `.badge-neutral`
- **Accessibility:** `.sr-only`
- **Loading:** `.skeleton`

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
| [animations-reference.md](references/animations-reference.md) | Keyframes, classes, stagger, a11y   |
| [utilities-reference.md](references/utilities-reference.md)   | Glass, badges, gradients, skeleton  |
| [scss-patterns.md](references/scss-patterns.md)               | File naming, @use/@forward, nesting |
