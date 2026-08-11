---
paths:
  - 'src/views/**/*.vue'
  - 'src/components/**/*.vue'
---

# i18n mandatory

All user-visible text in Vue templates MUST use `t('key')` from vue-i18n. Never hardcode display strings — attribute text (aria-label, title, placeholder) included.

Keys are added by the `translate` agent — never edit `src/translate/*.json` yourself (rule `locale-delegation`).

Why: a hardcoded string cannot reach `fr.json`, so it ships untranslated in the second locale, and `check_locales.py`'s parity check has nothing to compare against — it can only catch a key that exists in one locale and not the other, not a string that never became a key at all.
