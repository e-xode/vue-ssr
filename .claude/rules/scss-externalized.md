---
paths:
  - 'src/views/**/*.vue'
  - 'src/components/**/*.vue'
---

# SCSS externalized

Never write a `<style>` block with inline CSS/SCSS in a Vue file. Every component with styles has its own `.scss` file (see CLAUDE.md hard rules for the naming and `<style>` reference convention, and `styles/variables.scss` for tokens).
