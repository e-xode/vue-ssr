# Mixins Reference

> All 11 mixins from `src/styles/mixins.scss`. Auto-injected — no `@use` needed.

## flex-center

Centers content on both axes using flexbox.

**Signature:** `@mixin flex-center`

```scss
.overlay {
  @include flex-center;
  height: 100vh;
}
```

**Output:**
```css
display: flex;
align-items: center;
justify-content: center;
```

## flex-between

Horizontal layout with space-between and vertical centering.

**Signature:** `@mixin flex-between`

```scss
.header {
  @include flex-between;
  padding: $spacing-md;
}
```

**Output:**
```css
display: flex;
align-items: center;
justify-content: space-between;
```

## flex-col

Column flex layout.

**Signature:** `@mixin flex-col`

```scss
.sidebar {
  @include flex-col;
  gap: $spacing-sm;
}
```

**Output:**
```css
display: flex;
flex-direction: column;
```

## truncate

Single-line text with ellipsis overflow.

**Signature:** `@mixin truncate`

```scss
.title {
  @include truncate;
  max-width: 200px;
}
```

**Output:**
```css
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
```

## multiline-truncate

Clamp text to a specific number of lines.

**Signature:** `@mixin multiline-truncate($lines: 2)`

| Parameter | Default | Description |
| --- | --- | --- |
| `$lines` | 2 | Number of visible lines before truncation |

```scss
.description {
  @include multiline-truncate(3);
}
```

**Output:**
```css
display: -webkit-box;
-webkit-line-clamp: 3;
-webkit-box-orient: vertical;
overflow: hidden;
```

## absolute-center

Centers an absolutely-positioned element within its relative parent.

**Signature:** `@mixin absolute-center`

```scss
.spinner {
  @include absolute-center;
}
```

**Output:**
```css
position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
```

## transition

Configurable transition shorthand.

**Signature:** `@mixin transition($property: all, $duration: 300ms, $timing: ease)`

| Parameter | Default | Description |
| --- | --- | --- |
| `$property` | all | CSS property to animate |
| `$duration` | 300ms | Duration |
| `$timing` | ease | Timing function |

```scss
.link {
  @include transition(color, $transition-fast);
}

.card {
  @include transition(transform, $transition-base, ease-out);
}
```

**Output:**
```css
transition: color 150ms ease;
```

## hover-lift

Adds an upward lift and shadow on hover. Includes its own transition setup.

**Signature:** `@mixin hover-lift`

```scss
.card {
  @include hover-lift;
  border-radius: $border-radius-md;
}
```

**Output:**
```css
transition: transform, box-shadow 300ms ease;

&:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

## button-reset

Strips all browser default button styling.

**Signature:** `@mixin button-reset`

```scss
.icon-button {
  @include button-reset;
  @include flex-center;
  width: 40px;
  height: 40px;
}
```

**Output:**
```css
padding: 0;
border: none;
background: none;
cursor: pointer;
font-family: inherit;
font-size: inherit;
```

## visually-hidden

Hides element visually while keeping it accessible to screen readers.

**Signature:** `@mixin visually-hidden`

```scss
.skip-link {
  @include visually-hidden;

  &:focus {
    position: static;
    width: auto;
    height: auto;
    clip: auto;
    overflow: visible;
  }
}
```

**Output:**
```css
position: absolute;
width: 1px;
height: 1px;
padding: 0;
margin: -1px;
overflow: hidden;
clip: rect(0, 0, 0, 0);
white-space: nowrap;
border-width: 0;
```

## respond-to

Mobile-first media query wrapper. Accepts breakpoint name strings.

**Signature:** `@mixin respond-to($breakpoint)`

| Parameter | Accepted values |
| --- | --- |
| `$breakpoint` | `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'` |

```scss
.container {
  padding: $spacing-sm;

  @include respond-to('md') {
    padding: $spacing-md;
  }

  @include respond-to('lg') {
    padding: $spacing-xl;
  }

  @include respond-to('2xl') {
    max-width: 1400px;
    margin: 0 auto;
  }
}
```

**Output (for 'md'):**
```css
@media (min-width: 768px) {
  padding: 16px;
}
```

## Composition patterns

Mixins compose well together:

```scss
.nav {
  @include flex-between;
  padding: $spacing-md $spacing-lg;

  @include respond-to('lg') {
    padding: $spacing-md $spacing-xl;
  }
}

.feature-card {
  @include flex-col;
  @include hover-lift;
  padding: $spacing-lg;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-md;
}

.custom-button {
  @include button-reset;
  @include flex-center;
  @include transition(background-color, $transition-fast);
  padding: $spacing-sm $spacing-md;
  border-radius: $border-radius-sm;
}
```
