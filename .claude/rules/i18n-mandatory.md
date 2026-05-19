---
paths:
  - 'src/views/**/*.vue'
  - 'src/components/**/*.vue'
---

# i18n mandatory

All user-visible text in Vue templates MUST use `t('key')` from vue-i18n. Never hardcode display strings.

- Import `useI18n` from `vue-i18n` in `<script setup>`
- Destructure: `const { t } = useI18n()`
- Template usage: `{{ t('key.path') }}` or `:label="t('key.path')"`
- Add keys to both `src/translate/en.json` AND `src/translate/fr.json`
- Attribute text (aria-label, title, placeholder) also uses `t()`
