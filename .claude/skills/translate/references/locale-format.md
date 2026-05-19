# Locale file format

## File locations

```
src/translate/en.json   (English — source of truth)
src/translate/fr.json   (French — must mirror en.json structure exactly)
```

## JSON structure rules

1. **Root is a flat object of sections** — Each top-level key is a section name.
2. **Values are either objects (nesting) or strings (leaf translations)** — No arrays, no numbers, no booleans.
3. **Maximum depth: 4 levels** — `section.subsection.group.key` is the deepest allowed.
4. **Alphabetical sort** — Keys within every object level are sorted alphabetically (a-z).
5. **No trailing commas** — Standard JSON (not JSON5 or JSONC).
6. **2-space indentation** — Matches project Prettier config.
7. **File ends with a newline** — Single trailing `\n`.

## Alphabetical ordering

Every sibling key group must be alphabetically sorted. This applies at ALL levels.

```json
{
  "a11y": { ... },
  "account": { ... },
  "admin": { ... },
  "app": { ... },
  "contact": { ... }
}
```

Within a section:
```json
{
  "admin": {
    "logs": { ... },
    "users": { ... }
  }
}
```

## Interpolation syntax

Format: `{parameterName}`

- Curly braces (not double curly braces — those are Vue template syntax)
- Parameter name in camelCase
- No spaces inside braces: `{year}` not `{ year }`
- Both locales MUST use the same interpolation parameters (same names, same count)

### Examples

English:
```json
{
  "copyright": "© {year}. All rights reserved.",
  "subtitle": "You are signed in as {email}",
  "resendIn": "Resend in {seconds}s",
  "waitBeforeResend": "Please wait {seconds} seconds before requesting a new code",
  "bulkDeleteConfirm": "Are you sure you want to delete {count} log entries?"
}
```

French:
```json
{
  "copyright": "© {year}. Tous droits réservés.",
  "subtitle": "Vous êtes connecté en tant que {email}",
  "resendIn": "Renvoyer dans {seconds}s",
  "waitBeforeResend": "Veuillez patienter {seconds} secondes avant de demander un nouveau code",
  "bulkDeleteConfirm": "Voulez-vous vraiment supprimer {count} entrées de journal ?"
}
```

## Pluralization

The project does NOT currently use vue-i18n's built-in pluralization (`|` pipe syntax). Quantities are handled via interpolation (e.g., `{count} log entries`). If pluralization is needed in the future, use vue-i18n linked messages or the `@.plural` syntax.

## Edge cases

### Punctuation
- French uses non-breaking spaces before `:`, `?`, `!`, `;` — use the actual character, not `&nbsp;`.
- Periods and commas follow locale conventions.

### Special characters
- Apostrophes: Use the plain ASCII apostrophe `'` (not smart quotes). JSON handles this natively.
- Quotes inside strings: Escape with backslash `\"`.
- Ampersands, angle brackets: Use the literal character — vue-i18n handles escaping.

### Empty strings
- Never use empty string `""` as a translation value. If a key exists, it must have content.

### HTML in translations
- Do NOT embed HTML tags in translation strings. Use component interpolation (`<i18n-t>`) if markup is needed around translated content.

## Parity enforcement

Both `en.json` and `fr.json` must have:
- Identical key hierarchies (same sections, same nesting)
- Identical interpolation parameters per key
- No key present in one file but absent from the other

Run the parity check:
```bash
python3 .claude/skills/translate/scripts/check_locales.py --root .
```

## Adding a translation (checklist)

1. Determine the section and key path
2. Open `src/translate/en.json` — add key in alphabetical position
3. Open `src/translate/fr.json` — add same key in same position with French value
4. Ensure interpolation params match exactly
5. Run parity check script
6. Use `t('section.key')` in the component
