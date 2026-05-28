# Signature devices catalog

The concrete vocabulary of the clean-minimal direction. Each device names the exact **live** token or mixin to use and shows a minimal snippet. Tokens live in `src/styles/variables.scss`; mixins in `src/styles/mixins.scss`; both are auto-injected into every component SCSS via `_inject.scss` (Vite `additionalData: @use ".../styles/inject" as *`).

➜ See skill: design-scss — for the full token/mixin map and the injection chain.

**Reachability note (critical):** only `variables`, `typography`, and `mixins` are forwarded by `_inject.scss`. The classes in `_animations.scss` and `_utilities.scss` (`.animate-fade-up`, `.delay-*`, `.glass`, `.text-gradient-*`, `.hover-glow-*`, `.skeleton`) are **NOT** injected and are **NOT** `@use`d anywhere — they emit no CSS in this project. Do not use them. There is also **no global `prefers-reduced-motion` handler**, so every animated device must guard itself (see device 4).

## Tokens this direction relies on

Already defined — reuse, never hardcode:

- `$white` `#ffffff` and the gray ramp `$gray-50..900` — surfaces, text, borders.
- `$accent-indigo` `#4f46e5` (+ `$accent-indigo-hover` `#4338ca`, `$accent-indigo-active` `#3730a3`) — the single brand accent (mirrors Vuetify `primary`).
- `$border-radius-sm..xl` (4/8/12/16) — corners; `lg` (12) is the Vuetify default for cards/buttons/inputs.
- `$shadow-sm..xl` — soft, low-alpha shadows (max ~0.1). Used on hover/elevation only.
- `$transition-fast` (150ms), `$transition-base` (300ms), `$transition-slow` (500ms).
- `$spacing-*` on the 8px scale; `$section-py*` for vertical section rhythm.

## Devices

### 1. Quiet surface block

Section background alternation. Use `$white` for the default surface and `$gray-50` / `$gray-100` for the alternating one. Separate with the hairline border or a soft shadow.

```scss
.section--inset {
  background: $gray-50;
  border-top: $border-width-hairline solid $gray-200;
}
```

Two surfaces only: white ↔ light gray. Never a third tint, never a colored band. See SKILL → System 1 (quiet surface rhythm).

### 2. Bordered flat card

The kit's default surface. Vuetify `VCard` is already `elevation: 0` + `border: true` + `rounded: lg`. Keep cards flat at rest; let elevation appear on hover only.

```scss
.feature-card {
  border-radius: $border-radius-lg;
  border: $border-width-hairline solid $gray-200;
  padding: $spacing-lg;
  background: $white;
}
```

### 3. Canonical content-card hover (lift)

The sanctioned hover for content cards. Use the `hover-lift` mixin (translateY(-4px) + soft shadow). Apply the **same** hover to every peer in a grid.

```scss
.feature-card {
  @include hover-lift;
}
```

Alternative for the whole block (pick one, apply to all peers): an `outline`→`primary` border tint.

```scss
.feature-card {
  @include transition(border-color, $transition-fast);
  &:hover { border-color: $accent-indigo; }
}
```

No colored glow exists in this kit — do not invent one. See SKILL → System 2.

### 4. Restrained entrance / hover motion (self-guarded)

There is no global reduced-motion handler here, so animate `transform`/`opacity` only and add the guard yourself.

```scss
.reveal {
  opacity: 0;
  transform: translateY(8px);
  animation: reveal $transition-base ease forwards;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    transform: none;
  }
}

@keyframes reveal {
  to { opacity: 1; transform: none; }
}
```

Define the keyframes locally in the component SCSS (the global `_animations.scss` keyframes are not available).

### 5. Hairline divider

Section/element separation without a colored band.

```scss
.divider {
  border-top: $border-width-hairline solid $gray-200;
}
```

### 6. The single accent moment

Indigo earns attention by being rare: one primary CTA per view, links, focus ring, an active tab indicator. Use `$accent-indigo` (or the Vuetify `primary` token in templates). Never a second competing accent color in the same view. See `references/palette-roles.md`.

### 7. Monospace detail

`IBM Plex Mono` (`@fontsource/ibm-plex-mono`) for code snippets, tokens, or technical labels — a sober nod to the developer audience. Use sparingly, for genuinely technical content, not decoration.

## Adding a device

Append here only with: the exact **injected** token/mixin it uses, a minimal snippet, and a one-line justification against "restraint first / one accent per section". Prefer enriching an existing device over adding a new one. Never reference a `_utilities`/`_animations` class — verify the primitive renders before cataloging it.
