---
name: brand-art-direction
description: "Material Design 3 / Vuetify 4 art-direction charter for the Vue SSR Starter Kit (e-xode/vue-ssr): the opinionated, screenshot-verifiable brand-identity layer above design-scss and design-ux. Defines the clean-minimal direction (single indigo brand accent, neutral-gray chrome, bordered flat MD3 surfaces, 8px rhythm, restraint over decoration) as DECIDABLE screenshot-checkable systems: quiet surface rhythm, canonical hover/elevation per component archetype with sibling consistency, palette roles, decorative restraint, and an evidence-based pre-delivery checklist graded by the visual-qa agent. Trigger on ANY visual/finition or polish work on rendered views: card hovers, surface backgrounds, elevation, accent usage, hero/CTA styling. Load BEFORE design-scss/design-ux when styling views. Don't use for: SCSS token/mixin mechanics (→ design-scss), UX methodology (→ design-ux), Vuetify component API (→ vuetify-components), design routing (→ vue-ssr-design), marketing copy (→ content-strategy)."
---

# Brand Art Direction — Clean Minimal (MD3)

> Owns the **opinionated visual identity** of the Vue SSR Starter Kit. `design-scss` says _how_ to write SCSS; `design-ux` says _how_ to reason about hierarchy; this skill says _what the kit should feel like_ and _which restrained devices carry that feeling_. Load it first for any visual work on rendered views.

**Golden rule of this charter: if you cannot confirm it on a rendered screenshot, it is not done.** Every guardrail below is written to be answered from a PNG, not from intent. The `visual-qa` agent is the authoritative gate; this charter is the rubric it grades against.

## Positioning

The starter kit is a **clean, minimal, production-grade Material Design 3 foundation**. It must read as trustworthy, modern, and developer-grade. The signature is **restraint**: bordered flat surfaces, a single indigo brand accent, generous whitespace on an 8px rhythm, and elevation that appears only on interaction. Never decorative, never noisy. A forker should inherit a coherent, quiet, professional base they can extend — not a themed showcase.

This is the opposite of a "wow" brand: the win condition is calm consistency, not visual spectacle. When in doubt, do less.

| In scope                                            | Out of scope                                               |
| --------------------------------------------------- | ---------------------------------------------------------- |
| The clean-minimal direction and its systems         | SCSS token/mixin syntax and the file map (→ design-scss)   |
| Which restrained device to use, and where           | Visual-hierarchy / spacing-rhythm theory (→ design-ux)     |
| Functional role of each color (indigo vs feedback)  | Vuetify component selection / props (→ vuetify-components) |
| Restraint guardrails + pre-delivery checklist       | When to delegate to the design agent (→ vue-ssr-design)    |
| Evolving the charter over time                      | Marketing words and tone (→ content-strategy)              |

## Live primitives only (read this first)

This charter relies **exclusively** on primitives that actually render in this project:

- **Tokens** from `src/styles/variables.scss` (`$spacing-*`, `$border-radius-*`, `$shadow-sm..xl`, `$transition-*`, `$breakpoint-*`, `$gray-50..900`, `$white`, `$accent-indigo`).
- **The 11 mixins** in `src/styles/mixins.scss` (notably `hover-lift`, `transition`, `flex-*`, `respond-to`), auto-injected via `_inject.scss`.
- **Typography** (`Inter` body, `IBM Plex Mono` mono) and the **Vuetify theme + defaults** in `src/plugins/vuetify.js` (indigo `#4f46e5` primary, neutral-gray secondary, flat **bordered** cards, `rounded: lg`, tonal alerts).

It does **NOT** use `_animations.scss` / `_utilities.scss` classes (`.glass`, `.text-gradient-*`, `.hover-glow-*`, `.animate-fade-up`, `.delay-*`, `.skeleton`): they are **not** in the injection chain and emit **no CSS** in this project. Do not reference them — they render nothing. Consequently **`prefers-reduced-motion` is NOT honored globally**: any motion you add must carry its own `@media (prefers-reduced-motion: reduce)` guard. ➜ See skill: design-scss — token/mixin map (note: its `_utilities`/`_animations` listings are aspirational, not live here).

## The direction (what it must look like on screen)

1. **Quiet surfaces** — only two: white `surface` and a light-gray `background`/`surface-variant`. Section boundaries are marked by the hairline `outline` border or a token shadow, never a saturated color band.
2. **One brand color** — indigo `#4f46e5` (`primary`) carries identity: CTAs, links, active states, focus. Neutral gray is the chrome. There is no second expressive accent family.
3. **Borders over shadows** — MD3 outlined style. Cards are flat (`elevation 0`) and bordered by default; shadow appears only on hover/interaction, drawn from `$shadow-*`.
4. **Whitespace is the device** — rhythm comes from the 8px spacing scale and breathing room, not from decoration.
5. **Restrained motion** — animate `transform`/`opacity` only, with a self-contained reduced-motion guard. Short and purposeful (`$transition-fast`/`$transition-base`).
6. **Characterful but sober type** — `Inter` for UI, `IBM Plex Mono` for code/monospace moments. Weight and size create hierarchy; no gradient text, no display flourishes.
7. **Feedback colors stay feedback** — `success`/`warning`/`error` appear only on status, never as decoration.

## System 1 — Quiet surface rhythm

A page is built from exactly **two** surfaces: **white** (`surface`, `$white`) and **light gray** (`background` `$gray-50` / `surface-variant` `$gray-100`). No third tinted surface, no colored section band.

Cadence rules, all screenshot-checkable:

- **Alternate quietly.** Adjacent sections may switch surface to create rhythm; the switch is subtle, separated by the `outline` hairline or a soft `$shadow-sm`/`$shadow-md`.
- **Readable, not loud.** On the PNG you can tell one section from the next, but nothing shouts. A jarring color jump between sections is a defect (this is a minimal kit, not a warm-canvas brand).
- **No scatter.** Surface changes form an intentional structure down the page, not a random sprinkle.

## System 2 — Canonical hover/elevation per archetype (kills inconsistent states)

Every interactive surface has **exactly one** sanctioned hover, decided by its archetype. **Peers in the same grid share an archetype, therefore an identical hover.** Mixed hovers within one block = 🔴.

| Archetype             | Where (examples)                                  | Canonical hover                                                                                    |
| --------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Content card**      | feature/info grids, list cards, tiles             | `hover-lift` (translateY(-4px) + `$shadow`) **or** `outline`→`primary` border tint. Pick one per block; no colored glow. |
| **CTA / primary btn** | the single primary action per view                | Vuetify `VBtn` flat built-in state (darken toward `$accent-indigo-hover`). No custom halo.        |
| **List item / nav**   | nav links, list rows, menu entries                | Subtle `surface-variant` background tint; no lift.                                                 |
| **Icon in a card**    | leading icon inside a card                         | Reacts **with** its parent card hover (scale/shade). **Never its own separate effect.**           |

Verify by capturing `:hover` on the **first and last** card of a block and comparing the two PNGs — they must match.

## System 3 — Decorative restraint

- **No dead-utility decoration.** This kit has no live gradient/glass/glow primitives. Do not reach for `.glass`, `.text-gradient-*`, or `.hover-glow-*` — they render nothing. If you want a decorative panel, build it from live tokens (a `$gray-100` block, a hairline `outline` divider).
- **One accent moment per section, max.** The indigo accent earns attention by being rare.
- **Decorations stay inside their shape.** An accent bar/border on a rounded card uses `overflow: hidden` + a pseudo-element. **Never** a raw `border-left`/`border-top` on a `border-radius` element, and never a `::before`/`::after` offset outside the box — both produce square corners poking past the radius.

## System 4 — Palette roles

Indigo functional brand; gray neutral chrome; feedback colors for feedback only; never invent a decorative color. Full role map + contrast rule: [references/palette-roles.md](references/palette-roles.md).

## Anti-overload guardrails (rank above everything; when in doubt, do less)

- **Restraint first.** Whitespace, borders, and one indigo accent are the identity. Adding color/shadow/motion usually subtracts from it.
- **Sibling consistency.** Visual peers (same grid/section) are identical in hover, shadow, border, and decoration.
- **Motion self-guards.** Animate `transform`/`opacity` only; include a `prefers-reduced-motion: reduce` block (no global handler exists here).
- **Contrast holds.** Any text on a colored chip/button/surface meets WCAG AA. Decorative-only color is exempt (but this kit has almost none).
- **Decorations stay inside their shape.** See System 3.

## Pre-delivery checklist (every item answered from a screenshot)

Capture the page(s) with `scripts/screenshots.mjs`, then confirm from the PNGs:

1. **Surface rhythm** — in `<page>-desktop.png`, are sections quietly distinguishable (hairline/shadow), with no loud color band?
2. **Sibling hover** — in the first-card vs last-card `:hover` clips of each block, is the treatment identical?
3. **Canonical hover** — does each surface use exactly its archetype's hover (no rogue glow, no lift on a nav row)?
4. **No dead decoration** — is every intended decorative effect actually visible (nothing relying on a dead utility class that renders nothing)?
5. **Color roles** — does only indigo read as the brand/CTA color, with feedback colors confined to status?
6. **Contrast** — does text on any colored surface pass WCAG AA?
7. **Reduced motion** — in the `--reduced-motion` capture, are entrance/hover animations static/absent (proving the component's own guard works)?
8. **Responsive** — at mobile width, any overflow, collapse, or broken spacing?
9. **Rendering integrity** — do borders/decorations respect the corner radius (no straight bar past a rounded corner)? Any clipping, escaped decoration, overlap, clipped focus ring, or text overflow? (Objective bugs, charter-independent.)

Any 🔴/🟠 from `visual-qa` → fix and re-capture. Done means the PNGs are clean.

## Routing table

| If you need…                                            | Read                                                          |
| ------------------------------------------------------- | ------------------------------------------------------------- |
| The concrete device catalog (tokens, mixins, snippets)  | [references/signature-devices.md](references/signature-devices.md) |
| Which color is functional vs feedback, contrast rule    | [references/palette-roles.md](references/palette-roles.md)    |
| SCSS token/mixin mechanics and file map                 | ➜ See skill: design-scss — implementation reference           |
| UX hierarchy / spacing methodology                      | ➜ See skill: design-ux — methodology                          |
| Vuetify theme tokens and component defaults             | ➜ See skill: vuetify-theming, vuetify-overview                |
| To capture and grade the result                         | The `visual-qa` agent + `scripts/screenshots.mjs`             |

## How to evolve this charter

The charter is meant to live, not freeze.

- **Tune intensity** — if a surface or shadow reads too loud or too flat, adjust the token in `src/styles/variables.scss` (or the Vuetify theme) in one place and re-capture.
- **Add a device** — append it to `references/signature-devices.md` with its exact live token/mixin and a snippet; it must earn its place against "one accent per section" and use only injected primitives.
- **Add a hover archetype** — only if a genuinely new surface kind appears; add a row to System 2 with its single sanctioned hover.
- **Promote a color role** — a deliberate identity change: update `references/palette-roles.md`, change the Vuetify theme, note it in the changelog, re-capture all pages.
