# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Developers who start a server-rendered Vue 3 application and want a production-grade base instead of assembling one: solo developers and indie hackers, small teams and agencies, Vue developers studying SSR patterns, and technical leads evaluating a starting point. They fork or clone the kit, then extend and rebrand it. A second audience is the end user of the forked application, who meets the kit's UI as a visitor, a signed-in user, or an administrator.

## Product Purpose
`@e-xode/vue-ssr` is an open-source (MIT) Vue 3 SSR starter kit with authentication, i18n (EN/FR), an admin panel, a contact form and a MongoDB backend, published on npm and GitHub by E-XODE. Success is developer adoption: stars, installs, forks, and inbound interest in E-XODE's services. The shipped UI exists to be a coherent base that a forker inherits and extends, not a themed showcase.

## Positioning
A starter kit that ships a curated Claude Code configuration (agent fleet, skill library, path-scoped rules, single-command validation) alongside the code, so it is ready for AI pair programming from the first commit.

## Operating Context
Two surfaces. Public, indexed pages (home, contact) that present the kit. Noindex application surfaces (authentication, account, dashboard, admin) that demonstrate the flows a forker will build on. Every page is server-rendered and hydrated, locale-prefixed (`/en`, `/fr`), and themed light or dark. The app runs on port 3002 in development.

## Capabilities and Constraints
- Stack: Vue 3.5, Vite, Express 5, MongoDB driver, Vuetify 4 (Material Design 3), Pinia, Vue Router, vue-i18n. `package.json` is authoritative for versions.
- Email security-code authentication, session management, IP blocking, rate limiting, reCAPTCHA v3.
- Two locales, English and French; every user-visible string goes through `t('key')`.
- Styling is token-driven SCSS (`src/styles/variables.scss`) plus the Vuetify theme and defaults in `src/plugins/vuetify.js`; each component's styles live in its own `.scss` file.
- No code comments, Composition API only, no hardcoded colors, spacings or font sizes.
- Not decided: a hosted demo URL and any pricing or monetization. Do not invent either.

## Brand Commitments
- Name: E-XODE, package `@e-xode/vue-ssr`.
- Voice: professional, authentic, simple, humble; peer-to-developer; no empty buzzwords and no aggressive sales pitch.
- Personality: calm, trustworthy, modern, developer-grade. The win condition is consistency, not spectacle; when in doubt, do less.
- All produced content is bilingual (French and English), each reading natively.

## Evidence on Hand
- Real, verifiable figures live in `package.json` and the test suite; never quote a number that was not re-read from them.
- Marketing assets are under `src/assets/linkedin/`; page copy is in `src/translate/{en,fr}.json`.
- Absent: testimonials, customer logos, download counts, benchmarks and a live demo. Future work must not fabricate any of them.

## Product Principles
1. Restraint over decoration: the base must be quiet enough for a forker to rebrand without undoing anything.
2. Token-driven: every visual decision is a variable that a fork can swap in one place.
3. Accessible by default: WCAG 2.1 AA minimum, so forks inherit no accessibility debt.
4. Honest claims: concrete numbers only, sourced from the repository.
5. Bilingual by construction: nothing user-visible ships in one language only.

## Accessibility & Inclusion
WCAG 2.1 AA minimum: text contrast 4.5:1 (3:1 for large text and UI), full keyboard navigation, visible focus, touch targets of at least 44 px on mobile, and `prefers-reduced-motion` honored per component because no global handler exists. Text exposed to assistive technology (aria-label, title, placeholder) is localized.
