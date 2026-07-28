# Mixins reference — layout and content

> Layout and content mixins from `src/styles/mixins.scss`. Auto-injected — no `@use` needed. Interaction, state and responsive mixins: [mixins-interaction.md](./mixins-interaction.md).

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

| Parameter | Default | Description                               |
| --------- | ------- | ----------------------------------------- |
| `$lines`  | 2       | Number of visible lines before truncation |

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

