---
name: design-ux
description: "Design and UX methodology for the Vue SSR Starter Kit: design-first thinking, visual hierarchy (size > color > weight > position), Material Design 3 alignment via Vuetify 4, 8px spacing rhythm ($spacing-unit multiples), color semantics (primary for CTAs, success/error for feedback, neutral for chrome), micro-interactions (meaningful, restrained, accessible), responsive UX (mobile-first, breakpoint semantics), and WCAG 2.1 AA accessibility. Trigger on: UI quality, design direction, visual hierarchy, accessibility audit, responsive decisions, animation design, color review, UX patterns, user feedback design. This is methodology — the design agent is the executor. Don't use for: SCSS implementation (→ design-scss), Vuetify component API (→ vuetify-components), app architecture (→ vue-ssr-architecture), auth flow (→ vue-ssr-auth), deciding when to delegate design work (→ vue-ssr-design)."
---

# Design & UX

> **Contents:** [Philosophy](#philosophy) · [Method](#method) · [Visual hierarchy](#visual-hierarchy) · [Spacing](#spacing-rhythm) · [Color](#color-semantics) · [Micro-interactions](#micro-interactions) · [Accessibility](#accessibility) · [Responsive](#responsive-ux) · [References](#references)

Design-first methodology for the Vue SSR Starter Kit. Principles and decision frameworks for building interfaces that are beautiful, accessible, and consistent.

## Philosophy

1. **Design before code** — choose the aesthetic direction, layout, and interaction model before writing a single `<template>` line.
2. **Material Design 3** — Vuetify 4 is MD3-native. Lean into its elevation, shape, and color system rather than fighting it.
3. **Restraint over excess** — fewer visual elements with clear purpose beat a busy interface. Whitespace is a feature.
4. **Accessibility is non-negotiable** — WCAG 2.1 AA minimum. Every decision must pass the accessibility gate.
5. **Motion with meaning** — animations guide attention and confirm actions. Never decorative-only.

## Method

When designing a new view or component:

1. **Define the goal** — what is the user trying to accomplish?
2. **Establish hierarchy** — what is the primary action? What is secondary?
3. **Choose layout** — grid, flex, card-based? Mobile-first.
4. **Select tokens** — colors, spacing, typography from the design system.
5. **Add interaction** — hover, focus, loading, success/error states.
6. **Validate accessibility** — contrast, focus order, screen reader, motion.
7. **Review responsiveness** — test at sm, md, lg, xl breakpoints.

## Visual hierarchy

Priority system: **size > color > weight > position**.

- Largest element draws the eye first
- Saturated/contrasting colors pull attention next
- Bold/heavy type adds emphasis within same-size text
- Position (top-left in LTR) establishes reading flow

Use Vuetify's typography classes (`text-h1` through `text-body-2`) consistently. Never skip heading levels.

→ See [references/visual-hierarchy.md](./references/visual-hierarchy.md)

## Spacing rhythm

The project uses an **8px base unit** (`$spacing-unit`).

| Token          | Value | Use case                   |
| -------------- | ----- | -------------------------- |
| `$spacing-xs`  | 4px   | Tight gaps (icon-to-label) |
| `$spacing-sm`  | 8px   | Intra-component padding    |
| `$spacing-md`  | 16px  | Inter-element gaps         |
| `$spacing-lg`  | 24px  | Section padding            |
| `$spacing-xl`  | 32px  | Major section breaks       |
| `$spacing-2xl` | 48px  | Page-level margins         |
| `$spacing-3xl` | 64px  | Hero sections              |

All spacing must be multiples of 4px. Never use arbitrary pixel values.

## Color semantics

Values reflect the live Vuetify theme in `src/plugins/vuetify.js` (light mode).

| Role      | Color                    | Usage                                  |
| --------- | ------------------------ | -------------------------------------- |
| Primary   | `#4f46e5` (indigo)       | CTAs, active states, links, focus      |
| Secondary | `#525252` (neutral gray) | Supporting actions, chrome             |
| Accent    | `#4f46e5` (= primary)    | Highlights (alias of primary indigo)   |
| Success   | `#16a34a` (green)        | Confirmations, positive feedback       |
| Error     | `#dc2626` (red)          | Validation errors, destructive actions |
| Warning   | `#d97706` (amber)        | Caution states, degraded features      |
| Neutral   | gray scale               | Chrome, borders, disabled states       |

Rules:

- Primary color reserved for the single most important action per view
- Never use color as the sole indicator (pair with icon or text)
- Dark mode: colors shift for contrast but maintain semantic meaning

## Micro-interactions

Every interactive element must provide visible feedback across these states:

- **Hover** — subtle transform or color shift
- **Focus** — visible ring (keyboard navigation)
- **Active/pressed** — confirmation feedback
- **Loading** — skeleton or progress indicator
- **Disabled** — muted appearance, no pointer events

Timing tokens:

- `$transition-fast` (150ms) — buttons, toggles, small UI
- `$transition-base` (300ms) — cards, modals, layout shifts
- `$transition-slow` (500ms) — page transitions, emphasis

→ See [references/micro-interactions.md](./references/micro-interactions.md)

## Accessibility

WCAG 2.1 AA is the minimum bar. Key requirements:

- Color contrast ≥ 4.5:1 (normal text), ≥ 3:1 (large text/UI)
- All interactive elements reachable by keyboard
- Logical focus order matching visual layout
- `prefers-reduced-motion` respected — **no global handler exists** (the `_animations.scss` reset is not bundled); every animated component must add its own `@media (prefers-reduced-motion: reduce)` guard (➜ design-scss)
- Touch targets ≥ 44x44px on mobile
- All text (including aria-label, title, placeholder) via `t()` keys

→ See [references/accessibility.md](./references/accessibility.md)

## Responsive UX

Mobile-first design with progressive enhancement:

| Breakpoint | Width    | Target                      |
| ---------- | -------- | --------------------------- |
| xs         | < 640px  | Phones                      |
| sm         | ≥ 640px  | Large phones, small tablets |
| md         | ≥ 768px  | Tablets                     |
| lg         | ≥ 1024px | Laptops                     |
| xl         | ≥ 1280px | Desktops                    |

Principles:

- Design for xs first, add complexity as viewport grows
- Touch interactions on mobile, hover enhancements on desktop
- Content priority: show essential content always, progressive disclosure for secondary

→ See [references/responsive-ux.md](./references/responsive-ux.md)

## Design system tokens

The project's design tokens live in `src/styles/variables.scss`:

- Border radius: sm (4px), md (8px), lg (12px), xl (16px)
- Shadows: sm, md, lg, xl (soft, layered)
- Vuetify defaults: rounded `lg`/`xl`, flat variant, outlined inputs, tonal alerts

Live helpers (auto-injected mixins): `flex-center`, `flex-col`, `hover-lift`, `transition`, `respond-to`, `visually-hidden`, etc. ➜ design-scss.

> The class-based helpers (`.glass`, `.text-gradient-*`, `.hover-lift`, `.hover-scale`, `.skeleton`, `.animate-*`, `.delay-*`, `.sr-only`) live in `_utilities.scss` / `_animations.scss`, which are **not bundled** in this project — they render nothing. Use the live **mixins** (e.g. the `hover-lift` mixin, the `visually-hidden` mixin) and component-local keyframes instead. ➜ design-scss.

## References

| File                                                        | Covers                                                                |
| ----------------------------------------------------------- | --------------------------------------------------------------------- |
| [visual-hierarchy.md](./references/visual-hierarchy.md)     | Typography, spacing rhythm, focal points, card composition, alignment |
| [micro-interactions.md](./references/micro-interactions.md) | Hover states, transitions, loading, feedback, page transitions        |
| [accessibility.md](./references/accessibility.md)           | WCAG compliance, contrast, focus, aria, motion, forms                 |
| [responsive-ux.md](./references/responsive-ux.md)           | Breakpoints, mobile-first, touch vs pointer, content priority         |
