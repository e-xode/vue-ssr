# Tone and voice

The operational voice for every piece of content that markets the kit. This is the _how to write_;
the _what is true_ (the kit, its stack, its features) lives in the `marketing-content` skill.

➜ See skill: marketing-content — canonical facts, stack, features, the differentiator.

## Voice in one line

A senior developer writing to a peer: someone who has shipped real production apps and is sharing a
foundation they actually use. Calm, concrete, a little dry. Never a salesperson, never a hype thread.

## The five voice rules

1. **Bilingual, always** — every piece ships in French and English. Neither is a machine translation
   of the other: write each so it reads natively. Same facts, same structure, idiomatic in each
   language.
2. **Humble and concrete** — claims are backed by real, checkable facts (the exact stack versions
   from `package.json`, the test count, EN+FR locales, the agent/skill fleet). No superlatives, no
   "best", no "revolutionary". The kit is a solid foundation, not a silver bullet.
3. **Short sentences, human rhythm** — vary length. A long sentence, then a short one. Read it aloud;
   if you run out of breath, cut it.
4. **No `→` arrow character, ever, in produced content** — use bullet lists, dashes, or separate
   sentences. (This is a hard content rule; the arrow is fine inside `.claude/` config like this
   file, never in a published post/article/README/page copy.)
5. **Earn the CTA** — give value first (a technical insight, a lesson, a concrete feature), then make
   one clear ask. One call to action per piece, not three.

## Avoid / Prefer

The wrong column is verbatim bad phrasing; the right column is the fix. FR strings are quoted so they
read as examples, not prose.

| Avoid (anti-pattern)                                          | Prefer                                                                                           |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Buzzword stacking: `boilerplate révolutionnaire et clé en main` | Name the concrete thing: `SSR Vue 3 avec authentification par code de sécurité, prêt à forker`   |
| Hype superlative: `the best Vue starter kit out there`        | Scoped, provable: `a Vue 3 + Express SSR base with auth, i18n, and an admin panel built in`      |
| Vague benefit: `gagnez du temps`                              | Mechanism + outcome: `l'authentification par email et le rendu SSR sont déjà câblés et testés`   |
| Arrow as connector: `forkez `+`configurez `+`déployez`        | Dash or list: `forkez, configurez, déployez`                                                     |
| Fake urgency: `téléchargez vite, offre limitée`               | Honest framing: `open-source sous licence MIT, forkez quand vous voulez`                         |
| Empty "we": `nous mettons un point d'honneur à la qualité`    | First person, specific: `j'ai ajouté une batterie de validation lint/build/test au commit`       |
| Wall of text                                                  | One idea per paragraph, blank line between                                                       |

## Bilingual discipline

- Draft both versions in the same session; never ship one language and "translate later".
- Keep proper nouns and tech terms identical across locales (`Vue`, `Vite`, `Express`, `MongoDB`,
  `Vuetify`, `SSR`, `Pinia`, `Claude Code`).
- Numbers and figures must match exactly between FR and EN.
- Hashtags: localize where natural (`#DéveloppementWeb` ↔ `#WebDev`) but keep tech tags identical
  (`#VueJS`, `#SSR`, `#OpenSource`).
- File naming reflects language: `<topic>-fr.md` and `<topic>-en.md` (see `channel-playbooks.md`).

## Self-check before saving

- [ ] FR and EN both present, each reads natively.
- [ ] Zero `→` characters in the content.
- [ ] At least one concrete, verifiable fact (version, count, feature).
- [ ] Exactly one clear CTA.
- [ ] No buzzword from the Avoid column survived.
