# Testing

Unit tests run on [Vitest](https://vitest.dev) 4. About 50 test files in `tests/unit/`
covering the API routes, the HTTP modules, the shared helpers, the composables, the store and the
SSR head.

## Running

```bash
npm test                  # run everything once (same as npm run test:run)
npm run test:watch        # re-run on change
npm run test:ui           # browser UI
npm run test:coverage     # coverage report (text, JSON, HTML)
npx vitest run tests/unit/api.auth.test.js     # one file
npx vitest run -t "refuses a blocked IP"       # by test name
```

With Docker: `docker compose exec node npm test`. The tests need neither MongoDB nor SMTP.

## Two projects

`vitest.config.js` defines two projects, selected by file name:

| Project  | Environment | Files                                                                         |
| -------- | ----------- | ----------------------------------------------------------------------------- |
| `server` | `node`      | `tests/unit/api.*.test.js`, `tests/unit/shared.*.test.js`                     |
| `client` | `happy-dom` | everything else (`composables.*`, `stores.*`, `views.*`, `ssr.*`, `router`…), plus the browser-dependent `shared.analytics`, `shared.theme` and `shared.ssrState` |

Name a new file after the module it tests: `src/api/http/errors.js` is tested by
`tests/unit/api.http.errors.test.js`, `src/shared/security.js` by
`tests/unit/shared.security.test.js`.

`tests/setup.js` sets a test environment (`NODE_ENV=test`, placeholder SMTP and MongoDB values)
and replaces `console` with mocks, so a test can assert on `console.error`. Mocks are reset
between tests (`mockReset`, `restoreMocks`).

## Testing an API route

`tests/fixtures/routeHarness.js` runs a route handler without Express or MongoDB:

```js
import { describe, it, expect, vi } from 'vitest';
import { setupResendCodeRoute } from '#src/api/auth/resendCode.js';
import {
  callRoute,
  createCollection,
  createDb,
  createReq,
  createRouteApp,
} from '../fixtures/routeHarness.js';

describe('api/auth resend-code', () => {
  it('answers the generic response for an unknown email', async () => {
    const users = createCollection({ findOne: vi.fn().mockResolvedValue(null) });
    const { app, routes } = createRouteApp();
    setupResendCodeRoute(app, createDb({ users }));

    const req = createReq({ body: { email: 'nobody@example.com' } });
    const res = await callRoute(routes, 'POST /api/auth/resend-code', req);

    expect(res.body).toEqual({ status: 'code_sent', email: 'nobody@example.com' });
  });
});
```

- `createCollection(overrides)` is a fake MongoDB collection; override the methods the route calls.
- `callRoute` invokes the last handler of the route, so middleware such as `requireAuth` is
  skipped: set what it would have set (`createReq({ userId, authUser })`).
- Mock side effects at the module boundary, keeping the rest real:

  ```js
  vi.mock('#src/shared/email.js', async (importOriginal) => ({
    ...(await importOriginal()),
    sendSecurityCodeEmail: vi.fn(),
  }));
  ```

## Testing a composable or a component

Client tests run in `happy-dom` with `@vue/test-utils`. Mount with the plugins the component needs
(i18n, Pinia, a stubbed router); see `tests/unit/views.index.test.js` and
`tests/unit/components.header.test.js`. Composables that need a component context are called
inside a small host component; pure ones are called directly.

## What to test

- Every behaviour change comes with a test that fails without it.
- For API routes: the success path, each refusal (status and error key), and that nothing is
  queried or sent when validation fails.
- For security-sensitive code: hostile input (operator objects instead of strings, path traversal,
  oversized values), not only the happy path.
- Assert behaviour, not implementation details; no snapshot of large HTML.

## Conventions

- No comments in test files; the test name says what is verified.
- `describe` names the module, `it` states the expected behaviour in plain words.
- No network, no real database, no timers left running. Use `vi.stubEnv` and `vi.stubGlobal`, and
  undo them in `afterEach`.
- `max-lines` rules are relaxed for tests, the other lint rules apply.

## Continuous integration

`.github/workflows/npm-test.yml` runs four separate jobs on every push and pull request: `format`
(`format:check`), `lint` (`lint:check`), `test` (`test:run`) and `build`. `npm run validate` runs
the same four locally.
