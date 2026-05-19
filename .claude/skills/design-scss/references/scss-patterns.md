# SCSS Patterns

> Component-scoped file conventions, @use/@forward patterns, nesting rules, and file naming.

## Component-scoped SCSS files

Every Vue component with styles must have a dedicated `.scss` file.

### File placement

The SCSS file lives next to its Vue component:

```
src/views/Auth/
├── SigninView.vue
├── SigninView.scss
├── SignupView.vue
├── SignupView.scss
├── VerifyCodeView.vue
├── VerifyCodeView.scss
├── ForgotPasswordView.vue
├── ForgotPasswordView.scss
├── ResetPasswordView.vue
└── ResetPasswordView.scss

src/components/layout/
├── TheHeader.vue
├── TheHeader.scss
├── TheFooter.vue
└── TheFooter.scss
```

### Vue component reference

```html
<style lang="scss" scoped src="./ComponentName.scss"></style>
```

Rules:
- Always `lang="scss"`
- Always `scoped`
- Always external `src` attribute
- Never inline styles in the `<style>` block
- File name matches component name exactly

## Auto-injection system

`src/styles/_inject.scss` is a barrel file:

```scss
@forward 'variables';
@forward 'mixins';
```

This is configured in `vite.config.js`:

```js
css: {
  preprocessorOptions: {
    scss: {
      additionalData: `@use '@/styles/_inject.scss' as *;\n`
    }
  }
}
```

**Consequence:** All variables (`$spacing-md`, `$shadow-lg`, etc.) and all mixins (`@include flex-center`, etc.) are available in every `.scss` file without any import statement.

## What NOT to import

Since `_inject.scss` provides variables and mixins automatically:

- Do NOT add `@use '../styles/variables'` in component SCSS files
- Do NOT add `@use '../styles/mixins'` in component SCSS files
- Do NOT add `@import` statements (deprecated in modern Sass)

## Global styles vs scoped styles

| File | Scope | Loaded by |
| --- | --- | --- |
| `_animations.scss` | Global | App entry (main.js or App.vue) |
| `_utilities.scss` | Global | App entry (main.js or App.vue) |
| `Component.scss` | Scoped (data attribute) | Vue SFC `<style>` tag |

Global utility classes (`.animate-fade-up`, `.glass`, `.badge-success`) work anywhere in templates because they are loaded globally. Component-scoped styles use Vue's scoped attribute isolation.

## Nesting rules

Keep nesting shallow (max 3 levels deep):

```scss
.card {
  padding: $spacing-md;

  &__title {
    font-weight: 600;
  }

  &__content {
    margin-top: $spacing-sm;
  }

  &:hover {
    box-shadow: $shadow-lg;
  }
}
```

Avoid deep nesting:

```scss
.card {
  .header {
    .title {
      .icon {
        ...
      }
    }
  }
}
```

## BEM-like naming

Use BEM-inspired naming for component internals (with Vue scoping, strict BEM is optional):

```scss
.signin {
  &__form {
    @include flex-col;
    gap: $spacing-md;
  }

  &__actions {
    @include flex-between;
    margin-top: $spacing-lg;
  }

  &__link {
    @include transition(color, $transition-fast);
  }
}
```

## File structure template

When creating a new component SCSS file:

```scss
.component-name {
  @include flex-col;
  padding: $spacing-md;

  &__header {
    @include flex-between;
  }

  &__content {
    margin-top: $spacing-sm;
  }

  @include respond-to('md') {
    padding: $spacing-lg;
  }
}
```

## Prohibited patterns

1. **No hardcoded values:**
   - ❌ `padding: 16px`
   - ✅ `padding: $spacing-md`

2. **No code comments:**
   - ❌ `// card styles`
   - ✅ (just write clear, self-documenting selectors)

3. **No inline styles in Vue:**
   - ❌ `<style lang="scss" scoped>...</style>`
   - ✅ `<style lang="scss" scoped src="./Component.scss"></style>`

4. **No @import:**
   - ❌ `@import '../styles/variables';`
   - ✅ (auto-injected, no import needed)

5. **No magic numbers:**
   - ❌ `width: 347px`
   - ✅ Use percentage, flex, grid, or tokens

## Creating a new component SCSS file

Checklist:
1. Create `ComponentName.scss` next to `ComponentName.vue`
2. Add `<style lang="scss" scoped src="./ComponentName.scss"></style>` to the Vue file
3. Use only tokens and mixins (no hardcoded values)
4. Keep nesting ≤ 3 levels
5. No code comments
6. Test responsive behavior with `respond-to()` breakpoints
