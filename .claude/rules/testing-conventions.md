---
paths:
  - 'tests/**/*.test.js'
---

# Testing conventions

- **Framework: Vitest, two projects** — `server` (node environment) runs `tests/unit/api.*` and `tests/unit/shared.*` except `shared.analytics*`, `shared.theme*` and `shared.ssrState*` (they need a DOM); `client` (happy-dom) runs everything else. Name a test file after its target so it lands in the right project. Use `describe`/`it`/`expect`. Never use Jest globals (`jest.fn`, `jest.mock`) or Jasmine APIs.
- **Test utils** — import from `@vue/test-utils` for component tests: `mount`, `shallowMount`, `flushPromises`.
- **Setup file** — `tests/setup.js` runs before all tests. Shared mocks and global config live there.
- **File placement** — test files in `tests/unit/` (`<area>.<module>.test.js`, e.g. `api.auth.test.js`) or colocated as `*.test.js` next to source; route-handler harness in `tests/fixtures/routeHarness.js`.
- **Commands** — `npm test` and `npm run test:run` run once; `npm run test:watch` is the watch mode.
- **Globals** — `globals: true` in vitest config. No need to import describe/it/expect.
- **Aliases** — import via `@`/`#src`, never a relative `../../` path.
