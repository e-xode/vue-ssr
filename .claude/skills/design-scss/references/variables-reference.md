# Variables Reference

> Complete inventory of design tokens in `src/styles/variables.scss`.

**Contents:** [Colors](#colors) · [Spacing](#spacing) · [Border radius](#border-radius) · [Shadows](#shadows) · [Transitions](#transitions) · [Breakpoints](#breakpoints) · [Layout](#layout) · [Z-index](#z-index)

## Colors

| Token                    | Value     | Use case                                          |
| ------------------------- | --------- | -------------------------------------------------- |
| `$white`                 | `#ffffff` | Default content surface (`surface`)               |
| `$gray-50`                | `#fafafa` | Light section surface (`background`)               |
| `$gray-100`                | `#f5f5f5` | Inset panels (`surface-variant`)                    |
| `$gray-200`                | `#e5e5e5` | Hairline borders (`outline`)                        |
| `$gray-300`–`$gray-800`   | —         | Intermediate neutrals — chrome, disabled states, text |
| `$gray-900`                | `#171717` | Primary text (light theme)                          |
| `$accent-indigo`           | `#4f46e5` | The single brand accent — CTAs, links, active states, focus |
| `$accent-indigo-hover`     | `#4338ca` | Hover state for indigo-filled elements               |
| `$accent-indigo-active`    | `#3730a3` | Active/pressed state for indigo-filled elements      |

Never hardcode these hex values in component SCSS — reference the token. For the full light/dark
Vuetify theme palette (including feedback colors), see the `vuetify-theming` skill's
`references/color-palette.md`, the single source of truth for hex outside this file.

### Usage guidance

```scss
.card {
  background: $white;
  border: 1px solid $gray-200;
  color: $gray-900;
}

.link {
  color: $accent-indigo;

  &:hover {
    color: $accent-indigo-hover;
  }
}
```

## Spacing

Base unit: `$spacing-unit: 8px`

| Token          | Value | Use case                                     |
| -------------- | ----- | -------------------------------------------- |
| `$spacing-xs`  | 4px   | Inline gaps, icon padding, tight spacing     |
| `$spacing-sm`  | 8px   | Small padding, gap between related items     |
| `$spacing-md`  | 16px  | Standard padding, card content, form spacing |
| `$spacing-lg`  | 24px  | Section padding, larger gaps                 |
| `$spacing-xl`  | 32px  | Hero sections, major separations             |
| `$spacing-2xl` | 48px  | Page-level spacing, large containers         |

### Usage guidance

```scss
.card {
  padding: $spacing-md;
  gap: $spacing-sm;
  margin-bottom: $spacing-lg;
}

.section {
  padding: $spacing-xl 0;
}
```

## Border radius

| Token               | Value | Use case                           |
| ------------------- | ----- | ---------------------------------- |
| `$border-radius-sm` | 4px   | Buttons, small inputs, badges      |
| `$border-radius-md` | 8px   | Cards, modals, standard containers |
| `$border-radius-lg` | 12px  | Large cards, hero sections         |
| `$border-radius-xl` | 16px  | Feature cards, prominent elements  |

### Usage guidance

```scss
.button {
  border-radius: $border-radius-sm;
}

.card {
  border-radius: $border-radius-md;
}

.hero-card {
  border-radius: $border-radius-xl;
}
```

## Shadows

| Token        | Value                              | Use case                 |
| ------------ | ---------------------------------- | ------------------------ |
| `$shadow-sm` | `0 1px 2px 0 rgba(0,0,0,0.05)`     | Subtle elevation, inputs |
| `$shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1)`   | Cards, dropdowns         |
| `$shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1)` | Modals, elevated cards   |
| `$shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.1)` | Popovers, hover states   |

### Usage guidance

```scss
.card {
  box-shadow: $shadow-md;

  &:hover {
    box-shadow: $shadow-lg;
  }
}

.modal {
  box-shadow: $shadow-xl;
}
```

## Transitions

| Token              | Value | Use case                                       |
| ------------------ | ----- | ---------------------------------------------- |
| `$transition-fast` | 150ms | Micro-interactions, color changes, icon states |
| `$transition-base` | 300ms | Standard animations, reveals, transforms       |
| `$transition-slow` | 500ms | Page transitions, complex animations           |

### Usage guidance

```scss
.button {
  transition: background-color $transition-fast ease;
}

.card {
  transition:
    transform $transition-base ease,
    box-shadow $transition-base ease;
}

.page-enter {
  transition: opacity $transition-slow ease;
}
```

## Breakpoints

Mobile-first approach. Use with `respond-to()` mixin.

| Token             | Value  | Target                            |
| ----------------- | ------ | --------------------------------- |
| `$breakpoint-xs`  | 0      | Base (mobile)                     |
| `$breakpoint-sm`  | 640px  | Large phones, small tablets       |
| `$breakpoint-md`  | 768px  | Tablets                           |
| `$breakpoint-lg`  | 1024px | Small desktops, landscape tablets |
| `$breakpoint-xl`  | 1280px | Standard desktops                 |
| `$breakpoint-2xl` | 1536px | Large screens                     |

### Usage guidance

Do not use breakpoint variables directly in `@media` queries. Use the `respond-to()` mixin instead:

```scss
.grid {
  grid-template-columns: 1fr;

  @include respond-to('md') {
    grid-template-columns: repeat(2, 1fr);
  }

  @include respond-to('xl') {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## Layout

| Token                | Value  | Use case                                    |
| ---------------------- | ------ | ---------------------------------------------- |
| `$border-width-hairline` | 1px    | The hairline border that separates surfaces (System 1 of `brand-art-direction`) |
| `$header-height`         | —      | Fixed app-bar height, used to offset sticky/absolute content |
| `$container-sm`..`$container-xl` | —      | Max-width caps for `v-container`-equivalent layout wrappers |
| `$section-py-sm`         | 48px   | Compact section vertical padding               |
| `$section-py`            | 80px   | Standard section vertical padding              |
| `$section-py-lg`         | 128px  | Hero / landing section vertical padding        |

## Z-index

| Token          | Use case                                    |
| ---------------- | ---------------------------------------------- |
| `$z-base`        | Default stacking context                       |
| `$z-dropdown`     | Menus, select dropdowns                        |
| `$z-sticky`       | Sticky headers, sticky table headers           |
| `$z-header`       | The app bar                                     |
| `$z-overlay`      | Backdrop behind a modal/dialog                 |
| `$z-modal`        | Dialogs, modals                                 |
| `$z-skip-link`    | The accessibility skip-to-content link (always on top) |

Never hardcode a raw `z-index` number — pick the token matching the element's actual stacking role.
