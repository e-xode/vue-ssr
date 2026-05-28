# Utilities Reference

> All utility classes from `src/styles/_utilities.scss`.

> **STATUS — inert as shipped.** `_utilities.scss` is NOT forwarded by `_inject.scss` and is imported nowhere, so every class below (`.text-gradient-*`, `.hover-lift`, `.hover-scale`, `.glass`, `.glass-dark`, `.badge-*`, `.sr-only`, `.skeleton`) emits **no CSS** in the current build. Using them in a template does nothing. Reproduce the effect in a component SCSS from the live tokens/mixins instead — notably the `hover-lift` **mixin** (not the `.hover-lift` class) and the `visually-hidden` **mixin** (not `.sr-only`). To make these classes live project-wide, import `_utilities.scss` once in `main.js`. See `➜ design-scss` SKILL → Utility classes.

## Text gradients

Apply gradient coloring to text. Uses CSS custom properties for theme overridability.

| Class                      | Default gradient         | Use case             |
| -------------------------- | ------------------------ | -------------------- |
| `.text-gradient-primary`   | Indigo → Purple (135deg) | Headings, brand text |
| `.text-gradient-secondary` | Cyan → Blue (135deg)     | Secondary headings   |
| `.text-gradient-accent`    | Amber → Red (135deg)     | Emphasis, alerts     |

### Usage

```html
<h1 class="text-gradient-primary">Welcome to the platform</h1>
```

### Custom property overrides

```css
--gradient-primary: linear-gradient(135deg, #custom1, #custom2);
--gradient-secondary: linear-gradient(135deg, #custom3, #custom4);
--gradient-accent: linear-gradient(135deg, #custom5, #custom6);
```

## Hover effects

| Class          | Effect                                 | Transition       |
| -------------- | -------------------------------------- | ---------------- |
| `.hover-lift`  | translateY(-4px) + $shadow-lg on hover | $transition-base |
| `.hover-scale` | scale(1.02) on hover                   | $transition-base |

### Usage

```html
<div class="card hover-lift">Lifts on hover</div>
<div class="card hover-scale">Scales on hover</div>
```

These classes handle their own transition declarations — no additional transition setup needed.

## Glass effects (frosted)

Glassmorphism effects with backdrop blur.

| Class         | Background            | Blur | Border                           |
| ------------- | --------------------- | ---- | -------------------------------- |
| `.glass`      | rgba(255,255,255,0.7) | 12px | 1px solid rgba(255,255,255,0.2)  |
| `.glass-dark` | rgba(0,0,0,0.4)       | 12px | 1px solid rgba(255,255,255,0.08) |

### Usage

```html
<div class="glass">Light frosted panel</div>
<div class="glass-dark">Dark frosted panel</div>
```

Browser support: requires `backdrop-filter` (includes `-webkit-` prefix).

## Badge variants

Pill-shaped inline labels. Base `.badge` class provides layout; variant classes add color.

**Base styles:** inline-flex, centered, pill border-radius (9999px), 0.75rem font, font-weight 600.

| Class            | Background | Text color | Use case           |
| ---------------- | ---------- | ---------- | ------------------ |
| `.badge-primary` | Indigo 10% | #6366f1    | Default status     |
| `.badge-success` | Green 10%  | #16a34a    | Success, active    |
| `.badge-warning` | Amber 10%  | #d97706    | Pending, caution   |
| `.badge-error`   | Red 10%    | #dc2626    | Error, critical    |
| `.badge-neutral` | Gray 10%   | #4b5563    | Inactive, disabled |

### Usage

```html
<span class="badge badge-success">Active</span>
<span class="badge badge-warning">Pending</span>
<span class="badge badge-error">Failed</span>
```

### Custom property overrides

Each badge variant supports theming:

```css
--badge-primary-bg: rgba(99, 102, 241, 0.1);
--badge-primary-color: #6366f1;
--badge-success-bg: rgba(34, 197, 94, 0.1);
--badge-success-color: #16a34a;
```

## Screen-reader only

| Class      | Purpose                                                          |
| ---------- | ---------------------------------------------------------------- |
| `.sr-only` | Hides element visually but keeps it accessible to screen readers |

### Usage

```html
<span class="sr-only">Navigation menu</span>
<button>
  <icon />
  <span class="sr-only">Close dialog</span>
</button>
```

Identical implementation to the `visually-hidden` mixin. Use the class in templates; use the mixin in SCSS.

## Skeleton loading

| Class       | Effect                                |
| ----------- | ------------------------------------- |
| `.skeleton` | Animated shimmer gradient placeholder |

Uses the `shimmer` keyframe with a sweeping linear gradient. Includes `$border-radius-md`.

### Usage

```html
<div class="skeleton" style="height: 20px; width: 60%"></div>
<div class="skeleton" style="height: 200px"></div>
```

### Combining with layout

```html
<div class="card">
  <div class="skeleton" style="height: 180px"></div>
  <div class="skeleton" style="height: 16px; width: 80%; margin-top: 12px"></div>
  <div class="skeleton" style="height: 16px; width: 50%; margin-top: 8px"></div>
</div>
```
