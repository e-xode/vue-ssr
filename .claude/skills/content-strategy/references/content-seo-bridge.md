# Content / SEO bridge

When editorial work touches ranking and discoverability, and the daily growth/SEO advisory playbook.

➜ See skill: seo — how SEO is wired in this kit (`entry-server.js` meta injection from route `meta`
i18n keys, JSON-LD, hreflang, dynamic `robots.txt` + `sitemap.xml` in `server.js`). This reference is
the editorial side; `seo` owns the implementation.

## When content meets SEO

- **Landing/contact page copy** carries `meta.*` titles/descriptions in i18n (the route `meta.title`
  / `meta.description` / `meta.keywords` keys, resolved server-side). Copy changes there are SEO
  changes. ➜ delegate to translate for the keys, ➜ See skill: seo for the meta strategy.
- **README / npm** is the kit's primary discoverability surface. Clear, keyword-aware README headings
  and a sharp npm `description` drive GitHub/npm search and social previews. There is no on-site blog
  to rank — discoverability for the kit is GitHub, npm, and referral traffic from LinkedIn.
- **LinkedIn content is off-site** — it drives referral traffic and authority, not on-site ranking.
  No canonical/sitemap concern, but link back to the repo or the relevant on-site page.

## Reusing existing keywords

Indexable page meta lives in i18n under `meta.*` keys (see `src/router.js` route `meta` + the
`meta.*` keys in `src/translate/`). The npm `keywords` array (`vue`, `ssr`, `starter-kit`,
`boilerplate`, `authentication`) is the canonical vocabulary. Before inventing terms, reuse these in
page copy, article intros, README headings, and CTAs so on-site and off-site content reinforce the
same words.

## Daily growth / SEO playbook

For "what can I do today for growth / SEO", run this checklist and return a prioritized, actionable
list (quick editorial wins first, then SEO actions to delegate):

1. **Inventory + backlog gaps** — read `content-inventory.md` and `editorial-backlog.md`. Any
   high-priority backlog idea not yet started? Any published piece overdue a follow-up?
2. **Bilingual parity** — any inventory row not yet `published` in both FR and EN? Completing a
   missing locale is a fast win (and an hreflang win for on-site copy).
3. **Storefront freshness** — does the `README.md` and npm `description` reflect the current feature
   set and version? A stale storefront weakens adoption. Propose the next README/storefront edit.
4. **Keyword coverage** — scan the `meta.*` i18n keys and npm `keywords` for terms with no supporting
   content. Propose a post or page section that targets an under-served keyword.
5. **Core Web Vitals** — performance is a ranking factor; flag regressions as ➜ delegate to design
   (visual/CSS) or note for the orchestrator (code). ➜ See skill: seo.
6. **Structured-data / meta** — any public page missing meta keys or JSON-LD coverage? ➜ See skill:
   seo; ➜ delegate to translate for meta copy.

Output: a numbered list, each item tagged with effort (quick / medium) and owner (content / ➜
delegate). Offer to execute the first item.
