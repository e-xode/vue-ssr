# Domain routing

Assign each changed file to a review domain, then cite that domain's skills when scoring findings.

| Domain   | Path patterns                                                                                       | Skills to cite                                                                                        |
| -------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `vue`    | `src/**/*.vue`, `src/composables/**`, `src/stores/**`, `src/router.js`, `src/entry-*.js`             | `vue3-composition`, `vue3-components`, `vue3-templates`, `vue3-performance`, `vue-ssr-architecture`    |
| `design` | `*.scss`, `*.css`, template-only `.vue`, Vuetify layout or visual-only changes                      | `brand-art-direction`, `design-scss`, `design-ux`, `vuetify-overview`, `vuetify-layout`, `vuetify-components` |
| `server` | `server.js`, `src/api/**`, server-only `src/shared/**`                                              | `vue-ssr-server`, `vue-ssr-auth`, `vue-ssr-architecture`                                               |
| `tests`  | `*.test.js`, `tests/**`, test fixtures and utilities                                                | `vue3-composition`, plus the domain skill of the code under test                                       |
| `i18n`   | `src/translate/**`, vue-i18n message format changes                                                 | `translate`                                                                                            |
| `seo`    | `src/entry-server.js` meta/JSON-LD, `robots`/`sitemap` handlers in `server.js`, route meta           | `seo`, `vue-ssr-architecture`                                                                          |
| `docs`   | `*.md`, `.claude/skills/**`, `.claude/agents/**`, `.claude/rules/**`, `CLAUDE.md`                   | `claude-anthropic`, `skill-creator`, plus the domain skill the doc describes                           |
| `config` | `vite.config.js`, `vitest.config.js`, `eslint.config.js`, `package.json`, `.github/**`, Docker files | `vue-ssr-deployment`, `vue-ssr-validation`                                                             |

## Applicable path-scoped rules

Every finding on a file matching a rule's `paths:` glob must cite that rule: `api-error-handling`,
`changelog`, `claude-config`, `client-server-boundary`, `code-quality`, `i18n-mandatory`,
`locale-delegation`, `scss-externalized`, `server-scope-guard`, `server-security`,
`testing-conventions`.

## Cross-domain notes

- A `.vue` file with substantial script AND style changes belongs to both `vue` and `design`.
- A user-facing string added in a Vue file also activates `i18n` — and any direct edit of
  `src/translate/**` is a `locale-delegation` violation regardless of correctness.
- A docs change describing server behavior is `docs` plus `server` when it changes operational claims.
- A change under `.github/**` is `config`; note branch/CI behavior changes explicitly.
- Any diff touching `.claude/**` or `CLAUDE.md` additionally requires the config audit
  (`python3 .claude/skills/claude-anthropic/scripts/audit.py`).
