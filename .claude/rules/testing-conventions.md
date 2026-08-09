---
paths:
  - 'tests/**/*.test.js'
---

# Testing conventions

- **Framework: Vitest + happy-dom** — use `describe`/`it`/`expect`. Never use Jest globals (`jest.fn`, `jest.mock`) or Jasmine APIs.
- **Test utils** — import from `@vue/test-utils` for component tests: `mount`, `shallowMount`, `flushPromises`.
- **Setup file** — `tests/setup.js` runs before all tests. Shared mocks and global config live there.
- **File placement** — test files in `tests/unit/` or colocated as `*.test.js` next to source.
- **Globals** — `globals: true` in vitest config. No need to import describe/it/expect.
- **Aliases** — import via `@`/`#src`, never a relative `../../` path.
