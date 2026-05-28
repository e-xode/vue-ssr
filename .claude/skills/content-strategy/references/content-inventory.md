# Content inventory (the glossary)

The catalogue of every marketing piece already produced. This is the single source of truth for
"what exists" — read it BEFORE proposing any topic, update it AFTER shipping any piece.

## Why this file exists

1. **Anti-duplication** — never pitch a topic already covered. Search this table first.
2. **Follow-up radar** — published pieces often deserve a sequel; the `Follow-ups` column tracks them.
3. **Bilingual + format completeness** — the `Status` column surfaces missing locales or missing
   `.html` renders.

## Maintenance protocol

1. After shipping a piece (new or a debt fix), add or update its row the same turn.
2. Before proposing a new topic, read the whole table: skip duplicates, surface overdue follow-ups.
3. When an idea is promoted from `editorial-backlog.md`, move it here with a new ID and remove it from
   the backlog.
4. IDs: `A#` for articles, `P#` for posts. Increment, never reuse.

## Entry schema

`ID | Title | Channel | Lang | Date | Topic | Angle | Status | Files | Follow-ups`

- **Lang** — locales produced (`fr,en`).
- **Status** — `published`, `draft`, or a debt note (`missing EN`, `missing .html`).
- **Files** — relative to `src/assets/linkedin/` (or `i18n` for page copy).
- **Date** — last-touched (via `git log`), approximate is fine.

## Catalogue

No marketing pieces have shipped yet. This table starts empty; add the first row when the first piece
is produced. Example row (delete once a real piece replaces it):

| ID  | Title | Channel | Lang | Date | Topic | Angle | Status | Files | Follow-ups |
| --- | ----- | ------- | ---- | ---- | ----- | ----- | ------ | ----- | ---------- |
| —   | —     | —       | —    | —    | —     | —     | —      | —     | —          |
