---
paths:
  - 'src/views/**/*.vue'
  - 'src/components/**/*.vue'
---

# SCSS externalized

Every Vue component with styles MUST have a separate `.scss` file.

- File naming: `ComponentName.vue` → `ComponentName.scss` (same directory)
- Reference: `<style lang="scss" scoped src="./ComponentName.scss"></style>`
- Never write `<style>` blocks with inline CSS/SCSS in Vue files
- Use SCSS variables from `styles/variables.scss` — no hardcoded colors, spacings, or font sizes
- The `styles/_inject.scss` is auto-injected globally via vite.config.js (variables + mixins available everywhere)
