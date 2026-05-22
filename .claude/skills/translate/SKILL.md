---
name: translate
description: "i18n and translation reference for the Vue SSR Starter Kit (e-xode/vue-ssr): 2-locale system (EN/FR) with vue-i18n 11 in Composition API mode, nested JSON locale files at src/translate/{en,fr}.json, key naming conventions (section.subsection.camelCase), interpolation syntax ({param}), locale-aware routing via useLocalePath composable, and parity enforcement between locales. Trigger on any i18n work: adding/editing translations, creating new locale keys, fixing missing translations, checking locale parity, using t() in templates, locale routing, or internationalization questions. Don't use for: app architecture (→ vue-ssr-architecture), auth flow (→ vue-ssr-auth), post-task validation (→ vue-ssr-hooks), component styling (→ design-scss)."
---

# Translate

> Owns all internationalization knowledge: locale files, key structure, naming conventions, vue-i18n usage, interpolation, and locale routing.

## System overview

| Aspect | Detail |
| --- | --- |
| Library | vue-i18n 11, Composition API mode (`legacy: false`) |
| Locales | English (`en`), French (`fr`) |
| Locale files | `src/translate/en.json`, `src/translate/fr.json` |
| Fallback | `en` (always the reference locale) |
| Routing | Locale-prefixed: `/:locale(en|fr)/path` via `useLocalePath` |

Both locale files MUST have identical key structures at all times. English is the source of truth.

## Key naming convention

Pattern: `<section>.<subsection>.<camelCaseKey>`

Nesting depth: 2-4 levels maximum. Top-level sections map to views or domain areas.

Examples:
- `auth.signin.title`
- `admin.users.deleteConfirm.message`
- `index.hero.cta.start`

See [references/key-naming.md](./references/key-naming.md) for full rules and section inventory.

## Workflow: adding or editing translations

1. **Identify the section** — Find the correct top-level section for the key (view-based or domain-based).
2. **Check existing keys** — Search both locale files to avoid duplicates and reuse existing keys.
3. **Add to BOTH locales** — Always add the key to `en.json` AND `fr.json` simultaneously.
4. **Maintain alphabetical order** — Keys within each object are sorted alphabetically.
5. **Verify parity** — Run `python3 .claude/skills/translate/scripts/check_locales.py` to confirm no drift.

## vue-i18n usage in components

```vue
<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <h1>{{ t('auth.signin.title') }}</h1>
  <p>{{ t('footer.copyright', { year: new Date().getFullYear() }) }}</p>
</template>
```

Hard rule: ALL user-visible text must use `t('key')`. No hardcoded strings in templates.

## Interpolation

Syntax: `{paramName}` — curly braces with a camelCase parameter name.

```json
{
  "copyright": "© {year}. All rights reserved.",
  "codeSent": "A verification code has been sent to {email}. Enter it below to confirm the change.",
  "subtitle": "You are signed in as {email}",
  "resendIn": "Resend in {seconds}s"
}
```

Rules:
- Interpolation placeholders MUST be identical in both locales (same name, same count).
- Parameter names use camelCase.
- No HTML inside interpolation values.

See [references/locale-format.md](./references/locale-format.md) for full format rules.

## Locale-aware routing

The `useLocalePath` composable from `src/composables/useLocalePath.js` builds locale-prefixed paths:

```vue
<script setup>
import { useLocalePath } from '@/composables/useLocalePath'

const localePath = useLocalePath()
</script>

<template>
  <router-link :to="localePath('/dashboard')">
    {{ t('nav.dashboard') }}
  </router-link>
</template>
```

Route pattern: `/:locale(en|fr)/path` — the locale segment is always first.

## Alphabetical ordering

Keys within each JSON object MUST be sorted alphabetically. When inserting a new key, place it in correct alphabetical position relative to siblings.

Example (correct):
```json
{
  "cancel": "Cancel",
  "delete": "Delete",
  "save": "Save",
  "submit": "Submit"
}
```

## Section inventory

| Section | Purpose |
| --- | --- |
| `a11y` | Accessibility labels (screen readers) |
| `account` | Account management views (profile, email, password) |
| `admin` | Admin panel (users, logs) |
| `app` | Application-level metadata |
| `contact` | Contact form page |
| `dashboard` | Dashboard view |
| `error` | Error messages (validation, auth, server) |
| `footer` | Footer content |
| `forgotPassword` | Password recovery flow |
| `form` | Shared form labels and buttons |
| `index` | Homepage (hero, features, stack, opensource) |
| `message` | Generic flash/toast messages |
| `meta` | Page meta titles and descriptions (SEO) |
| `nav` | Navigation items |
| `resetPassword` | Password reset flow |
| `verify` | Email verification flow |

## Parity check script

```bash
python3 .claude/skills/translate/scripts/check_locales.py --root .
```

Exits 0 if both locales have identical key sets, 1 if any mismatch. Run after every translation change.

## References

- [references/key-naming.md](./references/key-naming.md) — Full naming rules, section prefixes, anti-patterns
- [references/locale-format.md](./references/locale-format.md) — JSON structure, interpolation, edge cases
