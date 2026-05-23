# Key naming conventions

## Pattern

```
<section>.<subsection>.<camelCaseKey>
```

- Top-level key = section (maps to a view or a domain area)
- Second-level key = subsection or direct leaf key
- Third/fourth level = deeper grouping when needed
- Maximum nesting depth: 4 levels

## camelCase rules

- Leaf keys always use camelCase: `signupFailed`, `deleteConfirm`, `backToSignin`
- Section and subsection keys use lowercase single words: `auth`, `admin`, `users`, `hero`
- Multi-word subsections use camelCase: `forgotPassword`, `resetPassword`, `deleteConfirm`
- Never use snake_case, kebab-case, or PascalCase

## Section prefix inventory

| Prefix           | Scope                                      | Example keys                                    |
| ---------------- | ------------------------------------------ | ----------------------------------------------- |
| `a11y`           | Accessibility (ARIA labels, screen reader) | `closeMenu`, `skipToContent`                    |
| `account`        | Account management page                    | `profile.title`, `email.codeSent`               |
| `admin`          | Admin panel                                | `users.title`, `logs.bulkDeleteConfirm.message` |
| `app`            | App-wide metadata                          | `name`, `byAuthor`                              |
| `contact`        | Contact form                               | `title`, `submit`, `success`                    |
| `dashboard`      | Dashboard page                             | `welcome`, `subtitle`                           |
| `error`          | All error messages                         | `unauthorized`, `auth.invalidCredentials`       |
| `footer`         | Site footer                                | `copyright`, `privacy`                          |
| `forgotPassword` | Forgot password flow                       | `title`, `submit`, `sent`                       |
| `form`           | Reusable form labels                       | `email`, `password`, `submit`                   |
| `index`          | Homepage                                   | `hero.title`, `features.ssr.description`        |
| `message`        | Toast/flash messages                       | `success`, `error`, `warning`                   |
| `meta`           | SEO page titles/descriptions               | `index.title`, `signin.description`             |
| `nav`            | Navigation links                           | `home`, `signin`, `signout`                     |
| `resetPassword`  | Password reset flow                        | `title`, `submit`, `success`                    |
| `verify`         | Email verification                         | `title`, `submit`, `resendIn`                   |

## Choosing the right section

Decision flow:

1. Is it a page-specific string? Use the page section (`index`, `contact`, `dashboard`).
2. Is it a form element reused across pages? Use `form`.
3. Is it an error message? Use `error` (with optional subsection like `error.auth`).
4. Is it navigation? Use `nav`.
5. Is it SEO metadata? Use `meta.<page>`.
6. Is it accessibility? Use `a11y`.

## Good key names

```
auth.signin.title
admin.users.deleteConfirm.message
index.hero.cta.start
error.auth.invalidCredentials
form.confirmPassword
meta.dashboard.title
verify.attemptsRemaining
```

## Bad key names (anti-patterns)

| Bad                               | Why                                               | Good                            |
| --------------------------------- | ------------------------------------------------- | ------------------------------- |
| `signInTitle`                     | Flat, no section hierarchy                        | `auth.signin.title`             |
| `admin_users_title`               | snake_case                                        | `admin.users.title`             |
| `AdminUsersTitle`                 | PascalCase                                        | `admin.users.title`             |
| `page.auth.sign-in.title`         | kebab-case subsection + unnecessary `page` prefix | `auth.signin.title`             |
| `errors.auth.invalid_credentials` | Plural section + snake_case leaf                  | `error.auth.invalidCredentials` |
| `btn.submit`                      | Abbreviation as section                           | `form.submit`                   |
| `homepage.section1.text`          | Generic names                                     | `index.hero.description`        |
| `a.b.c.d.e.f`                     | Too deep (>4 levels)                              | Flatten to 3-4 levels           |

## Adding a new section

Only add a new top-level section when:

- A new view is being created that has 3+ unique strings
- An existing section would become too large or semantically confused

Keep the section count minimal. Prefer nesting under existing sections.
