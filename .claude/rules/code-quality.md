---
paths:
  - 'src/**/*.js'
  - 'src/**/*.mjs'
  - 'src/**/*.vue'
  - 'server.js'
---

# Code quality (ESLint errors)

Mechanically enforced as ESLint `error` in `eslint.config.js` (a violation fails the `lint` stage of `npm run validate`) — the concrete form of the CLAUDE.md "No over-engineering / YAGNI" rule. No inline `eslint-disable` (the no-comments rule forbids it) — fix the code, don't silence the rule.

- **File size** — `max-lines: 500` (blank/comment lines skipped). Split an oversized module into cohesive units behind a barrel (`index.js`), keeping the public import path stable. Exception: `src/views/**/*.vue` allow up to 700 — they are declarative, template-heavy aggregators whose logic already lives in composables; don't fragment a template into micro-components just to cut lines.
- **Function size** — `max-lines-per-function: 80`. If it does two things or scrolls past a screen, split it. Exception: composable/store setup functions in `src/composables/**` and `src/stores/**` allow up to 150 (they wire and return many reactive members); extract real logic into module-level helpers and sub-composables rather than fragmenting the aggregator.
- **Complexity** — `complexity: 15`, `max-depth: 4`, `max-params: 5`. Flatten branches, return early, group params into an options object.
- **Constants discipline** — module-level VALUES (lookup tables, spec arrays, regex sets, enums, thresholds, magic numbers) live grouped and exported (UPPER_SNAKE_CASE) in `src/shared/const.js` or a per-feature `constants.js`, never declared mid- or end-file. NOT constants: `const fn = …` helpers and `const` locals stay in place.
- **Factor relentlessly** — a pattern seen twice becomes a helper; reuse `src/shared/` and `src/composables/` before writing new utility code.
- **One responsibility per file** — a file does one thing; split mixed concerns.

**Refactoring an oversized file is an isolated, behaviour-preserving phase** — prove identical output (golden-master) BEFORE mixing in a feature change.
