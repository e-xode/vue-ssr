---
paths:
  - 'src/views/**/*.vue'
  - 'src/components/**/*.vue'
---

# SCSS externalized

Never write a `<style>` block with inline CSS/SCSS in a Vue file. Every component with styles has its own `.scss` file (see CLAUDE.md hard rules for the naming and `<style>` reference convention, and `styles/variables.scss` for tokens).

Why: Vite's `_inject.scss` barrel only reaches files compiled as `.scss` — an inline `<style lang="scss">` block still gets Sass syntax support, but auto-injected tokens and mixins are wired through the same `additionalData` mechanism regardless of block-vs-file, so the real cost of inlining is losing the project's one-file-per-component convention (harder to find, harder to reuse, `design-scss` skill patterns assume a sibling file exists).
