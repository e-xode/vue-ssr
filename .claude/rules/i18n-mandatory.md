---
paths:
  - 'src/views/**/*.vue'
  - 'src/components/**/*.vue'
---

# i18n mandatory

All user-visible text in Vue templates MUST use `t('key')` from vue-i18n. Never hardcode display strings — attribute text (aria-label, title, placeholder) included.

Keys are added by the `translate` agent — never edit `src/translate/*.json` yourself (rule `locale-delegation`).
