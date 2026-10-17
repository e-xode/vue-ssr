---
name: design-scss
description: "SCSS design-system reference for the Vue SSR Starter Kit: design tokens in variables.scss, the 11 mixins, and component-scoped SCSS conventions. Trigger on ANY styling work: writing SCSS, choosing tokens, animations, component .scss files, Vuetify style overrides, layout utilities, or design-system questions. This is the token/mixin reference — the design agent loads it to produce SCSS. Don't use for: visual design decisions, palette, typography or layout direction (→ impeccable, with DESIGN.md), the screenshot checklist (→ brand-art-direction), app architecture (→ vue-ssr-architecture), auth (→ vue-ssr-auth), Docker/CI (→ vue-ssr-deployment), validation (→ vue-ssr-validation), Vuetify component API (→ vuetify-components), design delegation routing (→ vue-ssr-design)."
---

# Design SCSS

> Owns the SCSS design system: tokens, mixins, motion guards, component-scoped patterns, and responsive strategy.

## Division of responsibilities

Design decisions (direction, palette, typography, layout, polish, audits) go through the `impeccable` skill, which loads `PRODUCT.md` and `DESIGN.md`. This skill owns the token and mixin mechanics those decisions are written with.

| Concern | Owner |
| --- | --- |
| Visual direction, critique, polish, accessibility and responsive review | impeccable (reads `DESIGN.md`) |
| SCSS tokens, mixins, component-scoped files, transition tokens, reduced-motion guards | design-scss |
| Screenshot checklist graded by `visual-qa` | brand-art-direction |
| Deciding when to delegate design work | vue-ssr-design |

Project constraints that hold for every motion: animate `transform` and `opacity` only, and add the `prefers-reduced-motion: reduce` guard yourself, because no global handler exists. Touch targets are at least 44x44px on mobile.

## Architecture overview

```
src/styles/
├── variables.scss        # Design tokens (spacing, radius, shadow, transition, breakpoint)
├── _typography.scss      # Base typography (injected)
├── mixins.scss           # 11 reusable mixins
└── _inject.scss          # Barrel: @forward 'variables'; @forward 'typography'; @forward 'mixins'
```

**Auto-injection:** `_inject.scss` is injected into every component SCSS via Vite's `css.preprocessorOptions.scss.additionalData` (`@use ".../styles/inject" as *`). It forwards **only** `variables`, `typography`, and `mixins` — these are available everywhere without explicit `@use`.

There are no global animation or utility classes (`.animate-*`, `.delay-*`, `.glass`, `.text-gradient-*`, `.badge-*`, `.skeleton`, `.sr-only`); never reference them. Build the effect from tokens and mixins in the component's own `.scss`.

**Component-scoped files:** Every Vue component that needs styles has a dedicated `.scss` file:

```html
<style lang="scss" scoped src="./MyComponent.scss"></style>
```

## Token system (variables.scss)

| Category      | Tokens                                                                 | Base                  |
| ------------- | ---------------------------------------------------------------------- | --------------------- |
| Colors        | `$white`, `$gray-50`..`$gray-900`, `$accent-indigo`{,-hover,-active}   | Only hex allowed in component SCSS |
| Spacing       | xs (4px), sm (8px), md (16px), lg (24px), xl (32px), 2xl (48px)        | $spacing-unit: 8px    |
| Border-radius | sm (4px), md (8px), lg (12px), xl (16px)                               | —                     |
| Shadows       | sm, md, lg, xl                                                         | rgba-based box-shadow |
| Transitions   | fast (150ms), base (300ms), slow (500ms)                               | —                     |
| Breakpoints   | xs (0), sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px) | Mobile-first          |
| Layout        | `$border-width-hairline`, `$header-height`, `$container-sm`..`xl`, `$section-py-sm`/`$section-py`/`$section-py-lg` | — |
| Z-index       | `$z-base`, `$z-dropdown`, `$z-sticky`, `$z-header`, `$z-overlay`, `$z-modal`, `$z-skip-link` | — |

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

1. File lives next to its `.vue` file: `src/views/Auth/VerifyCodeView.scss`
2. Component references it: `<style lang="scss" scoped src="./VerifyCodeView.scss"></style>`
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

## Motion

No global `prefers-reduced-motion` handler exists, so every animation guards itself and animates `transform` and `opacity` only. Define keyframes locally in the component SCSS.

```scss
.reveal {
  opacity: 0;
  transform: translateY($spacing-sm);
  animation: reveal $transition-base ease forwards;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    transform: none;
  }
}

@keyframes reveal {
  to {
    opacity: 1;
    transform: none;
  }
}
```

Use the live mixins, not the dead classes: `hover-lift` for a card hover, `visually-hidden` for screen-reader-only text. A loading placeholder is `v-skeleton-loader` (➜ vuetify-components).

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
| [mixins-layout.md](references/mixins-layout.md)               | Flex, truncate, absolute-center mixins |
| [mixins-interaction.md](references/mixins-interaction.md)     | Transition, hover-lift, button-reset, visually-hidden, respond-to |
| [scss-patterns.md](references/scss-patterns.md)               | File naming, @use/@forward, nesting |
