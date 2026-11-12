# Contributing

Thanks for your interest in the Vue SSR Starter Kit. Bug reports, fixes, documentation
improvements and focused features are welcome.

## Before you start

- **Bugs and small fixes**: open a pull request directly.
- **Features**: open an issue first. The kit aims to stay small; a feature that most forks would
  delete is usually declined.
- **Security vulnerabilities**: do not open a public issue. See
  [.github/SECURITY.md](./.github/SECURITY.md).

Be respectful and constructive. Harassment or discriminatory language is not tolerated.

## Setup

Follow the [quick start](./docs/QUICK_START.en.md) (Docker, or Node.js 26 with a MongoDB server),
then create a branch from `master`:

```bash
git checkout -b fix/short-description
```

## Conventions

The linter enforces most of them; reviewers check the rest.

**Language.** Everything committed is in English: code, comments in configuration files, commit
messages, documentation. `README.fr.md` and `docs/QUICK_START.fr.md` are the only French files.

**JavaScript.**

- ES modules, no TypeScript. Prettier formats the code (2 spaces, single quotes, semicolons, 100
  columns).
- **No comments in `.js`, `.vue`, `.scss` or `.css` files.** Make the code say it: clear names and
  small named helpers. Limits: 500 lines per file, 80 lines per function, complexity 15.
- Never leave a `catch` block empty: at least `console.error(err)`.
- Reuse before adding: look in `src/shared/` and `src/composables/` first. Logic used twice belongs
  in `src/shared/`.
- No new dependency without a reason stated in the pull request.

**Vue.**

- Composition API with `<script setup>` only. Block order: script, template, style.
- No hard-coded user-visible text: `t('key')`, with the key in both `src/translate/en.json` and
  `fr.json`.
- One `.scss` file per component, referenced with
  `<style lang="scss" scoped src="./MyComponent.scss"></style>`. No inline `<style>` content.
- Use the tokens of `src/styles/variables.scss`; no hard-coded colours, spacing or font sizes.
- Code runs on the server too: no `window`, `document` or `localStorage` outside `onMounted` or a
  `typeof window` guard. `v-html` is forbidden.

**API.**

- One file per endpoint exporting `setupXRoute(app, db)`, registered in `src/api/router.js`.
- Read inputs with `readString`, `readTrimmed` or `readEmail`; validate ids with `parseObjectId`.
- Errors are `{ error: 'error.some.key' }` with the right status; the key exists in both
  translation files.
- Never return a user document without `USER_SAFE_PROJECTION` (or `findUserSafe`).

**Secrets.** The repository is public. Never commit credentials, tokens, private hostnames or
real personal data; `.env.example` holds placeholders only.

## Checks

```bash
npm run validate:changed   # while working: checks what you touched, fixes lint errors
npm run validate           # before pushing: lint, format, build and tests on everything
```

`npm run validate` is what CI runs (`lint:check`, `format:check`, `build`, `test:run`). Add or
update tests for every behaviour change; see [TESTING.md](./TESTING.md).

## Commits and pull requests

- Keep a pull request to one topic. Rebase on `master` rather than merging it in.
- Commit messages: a short imperative summary, optionally prefixed with a type
  (`fix: refuse a login code on password reset`). Explain the why in the body when it is not
  obvious.
- Add a line to `CHANGELOG.md` under `## [Unreleased]` for anything a user of the kit would notice
  (sections: Security, Added, Changed, Fixed, Removed, Package Updates). Mark a change that needs
  action from forks with ⚠️.
- Fill in the pull request template. CI must be green; a maintainer reviews and squash-merges.

## Releases

Maintainers cut releases: version bump, changelog, annotated `vX.Y.Z` tag. The tag publishes the
npm package and the Docker image. Versions follow semantic versioning: a change that requires
action from a fork is at least a minor version and is flagged in the changelog.

## License

By contributing you agree that your contribution is licensed under the [MIT License](./LICENSE).
