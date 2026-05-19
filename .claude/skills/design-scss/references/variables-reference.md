# Variables Reference

> Complete inventory of design tokens in `src/styles/variables.scss`.

## Spacing

Base unit: `$spacing-unit: 8px`

| Token | Value | Use case |
| --- | --- | --- |
| `$spacing-xs` | 4px | Inline gaps, icon padding, tight spacing |
| `$spacing-sm` | 8px | Small padding, gap between related items |
| `$spacing-md` | 16px | Standard padding, card content, form spacing |
| `$spacing-lg` | 24px | Section padding, larger gaps |
| `$spacing-xl` | 32px | Hero sections, major separations |
| `$spacing-2xl` | 48px | Page-level spacing, large containers |

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

| Token | Value | Use case |
| --- | --- | --- |
| `$border-radius-sm` | 4px | Buttons, small inputs, badges |
| `$border-radius-md` | 8px | Cards, modals, standard containers |
| `$border-radius-lg` | 12px | Large cards, hero sections |
| `$border-radius-xl` | 16px | Feature cards, prominent elements |

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

| Token | Value | Use case |
| --- | --- | --- |
| `$shadow-sm` | `0 1px 2px 0 rgba(0,0,0,0.05)` | Subtle elevation, inputs |
| `$shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1)` | Cards, dropdowns |
| `$shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1)` | Modals, elevated cards |
| `$shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.1)` | Popovers, hover states |

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

| Token | Value | Use case |
| --- | --- | --- |
| `$transition-fast` | 150ms | Micro-interactions, color changes, icon states |
| `$transition-base` | 300ms | Standard animations, reveals, transforms |
| `$transition-slow` | 500ms | Page transitions, complex animations |

### Usage guidance

```scss
.button {
  transition: background-color $transition-fast ease;
}

.card {
  transition: transform $transition-base ease, box-shadow $transition-base ease;
}

.page-enter {
  transition: opacity $transition-slow ease;
}
```

## Breakpoints

Mobile-first approach. Use with `respond-to()` mixin.

| Token | Value | Target |
| --- | --- | --- |
| `$breakpoint-xs` | 0 | Base (mobile) |
| `$breakpoint-sm` | 640px | Large phones, small tablets |
| `$breakpoint-md` | 768px | Tablets |
| `$breakpoint-lg` | 1024px | Small desktops, landscape tablets |
| `$breakpoint-xl` | 1280px | Standard desktops |
| `$breakpoint-2xl` | 1536px | Large screens |

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
