# Channel playbooks

Per-channel templates and conventions. Apply the voice from `tone-and-voice.md` and the facts from
the `marketing-content` skill to every template below.

➜ See skill: marketing-content — what the kit is, stack, features, asset locations.

## Where content lives

```
src/assets/linkedin/
├── articles/      # long-form articles, FR+EN .md pairs (optional .html render)
└── posts/         # short LinkedIn posts, FR+EN .md pairs
```

Landing/contact page copy is NOT a file: it is i18n in `src/translate/{en,fr}.json`, placed by the
`translate` agent. The repo `README.md` and the npm `description` are the kit's storefront copy.

## File naming convention

`<topic-slug>-<lang>.<ext>` — lowercase, hyphenated, language suffix last.

- LinkedIn article: `articles/<topic>-fr.md`, `articles/<topic>-en.md` (+ optional matching `.html`).
- LinkedIn post: `posts/<topic>-fr.md`, `posts/<topic>-en.md`.

After saving any piece, update `content-inventory.md`. ➜ See `content-inventory.md`.

---

## LinkedIn post

Voice: a developer sharing something they built/use. Humble, first person where natural.

Structure:

1. **Hook** (1 line) — the concrete thing or the lesson, no preamble.
2. **Body** (2-4 short paragraphs) — what it is, who it helps, the concrete mechanism or feature.
3. **Offer / ask** (1 paragraph) — one clear CTA.
4. **Link** — the repo or relevant page URL on its own line.
5. **Hashtags** — 3-5; tech tags identical across locales.

Skeleton (fill, keep zero `→`):

```text
<hook: the capability, the lesson, or the value in one sentence>

<what it is and who it serves, concretely>

<the mechanism / why it removes a pain>

<the single ask>

<https://github.com/e-xode/vue-ssr>

#VueJS #SSR #OpenSource
```

## LinkedIn article (long-form)

Always a pair: `<topic>-fr.md` + `<topic>-en.md`; add an `.html` render only if direct publishing is
needed.

Markdown structure:

- `# H1 title` — concrete and specific, not clickbait (e.g. "Wiring email security-code auth in a Vue SSR app").
- Opening paragraph that frames the problem or promise (often references a previous article when it is a follow-up).
- `## H2` sections, one idea each. Bold lead-ins (`**SSR meta injection.**`) work well for scannable points.
- Closing CTA section with the repo + contact links.
- A `---` separator, then a short signature block in italics.

## Page marketing copy (the landing/contact pages)

Visible page text is i18n, not free files. When rewriting a hero, feature blurb, or CTA:

1. Draft the FR + EN copy here, applying voice + facts.
2. **➜ delegate to translate** to place the keys in `src/translate/fr.json` and `en.json` (parity
   enforced). Do not edit the JSON yourself.
3. ➜ See skill: seo if the change touches `meta.*` titles/descriptions (route `meta` i18n keys).
4. ➜ delegate to design for any layout/visual change.

## README / npm storefront copy

The README is the kit's primary landing page on GitHub; the npm `description` is the one-line pitch.

- Lead with what the kit is and the one-line value (mirror the npm `description`).
- A scannable feature list (bullet points, no `→`), each feature concrete and verifiable.
- A quickstart (clone/install/dev) and the license.
- The differentiator (the Claude Code agent/skill fleet) deserves its own short section.
- README is English-first; a French section or a separate `README.fr.md` is optional but must follow
  the same bilingual discipline if added.

## CTA library

One CTA per piece. Pick by goal:

| Goal                  | FR CTA                                                            | EN CTA                                                       |
| --------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------ |
| Adoption (repo)       | `Le code est open-source : github.com/e-xode/vue-ssr`            | `It's open-source: github.com/e-xode/vue-ssr`                |
| Star / feedback       | `Un retour, une étoile, une issue : tout est bienvenu`           | `Feedback, a star, an issue: all welcome`                    |
| Services lead         | `Un projet Vue/SSR ? Parlons-en sur e-xode.net`                  | `A Vue/SSR project? Let's talk at e-xode.net`                |
| Soft / credibility    | `Heureux d'échanger sur le SSR avec Vue`                         | `Happy to discuss SSR with Vue`                              |

## Per-channel checklist

- [ ] Correct folder + `<topic>-<lang>` naming (LinkedIn), or routed to translate (page copy).
- [ ] FR + EN both produced.
- [ ] Voice + Avoid/Prefer applied; zero `→`.
- [ ] One CTA from the library (or an equivalent).
- [ ] `content-inventory.md` updated; `CHANGELOG.md` entry added under `## [Unreleased]`.
