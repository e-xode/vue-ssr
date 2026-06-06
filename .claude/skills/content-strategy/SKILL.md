---
name: content-strategy
description: "Editorial method and content operations for the Vue SSR Starter Kit (e-xode/vue-ssr): the how-to-produce layer on top of the marketing-content facts, for content that markets the open-source kit. Covers the editorial workflow (research, propose, draft FR+EN, verify, optimize), operational tone and voice (Avoid/Prefer, no arrow character, bilingual discipline), per-channel playbooks (LinkedIn posts and long-form articles, landing/contact page copy via i18n, the GitHub/npm README storefront), audience personas and angles, the content inventory glossary (anti-duplication, follow-up radar), the editorial backlog, and the daily growth/SEO advisory playbook. Trigger when writing or improving a LinkedIn post or article, page marketing copy, README/storefront copy, brainstorming content ideas, or asking what to do today for content/SEO. Don't use for: canonical product/stack/feature facts (→ marketing-content), i18n key placement (→ translate), meta/JSON-LD/sitemap (→ seo), visuals or layout (→ design)."
---

# Content strategy — Vue SSR Starter Kit

> The editorial **method** for marketing the open-source kit. This skill owns _how_ to research,
> propose, write, verify, and optimize content across LinkedIn, the landing/contact page copy, and
> the GitHub/npm storefront. The _facts_ it writes about (what the kit is, its stack, features,
> differentiator) live in the `marketing-content` skill. The `content` agent loads both.

## Division of responsibilities

| Concern                                                                | Skill                           |
| ---------------------------------------------------------------------- | ------------------------------- |
| What the kit is, stack, features, differentiator, asset locations      | `marketing-content` (the facts) |
| Editorial workflow, tone/voice, channel templates, personas            | `content-strategy` (the method) |
| Content inventory (what's published) and backlog (what's next)         | `content-strategy` references   |
| Strategy, monetization stance, campaigns, channel mix, positioning     | `marketing-strategy`            |
| i18n key placement                                                     | ➜ delegate to translate         |
| Meta, JSON-LD, hreflang, sitemap                                       | ➜ See skill: seo                |
| Visuals, layout, components                                            | ➜ delegate to design            |

## Core rules

These are the canonical content rules; their authoritative source is the `marketing-content` skill —
do not duplicate the facts here.

➜ See skill: marketing-content — bilingual FR+EN always, humble/concrete tone, no `→` arrow in
produced content, back claims with real numbers (re-read `package.json` for versions), save LinkedIn
assets under `src/assets/linkedin/`, document each piece. The operational _how_ for each rule is in
`references/tone-and-voice.md`.

➜ See skill: marketing-strategy — the strategy layer (positioning, monetization stance, campaigns,
channels) that decides what content to produce and why; this skill executes those decisions.

## Workflow

1. **Understand** the request: channel, audience, goal (adoption, credibility, feature announcement,
   ideas, daily advisory).
2. **Read the inventory** — `references/content-inventory.md` — before proposing anything. Skip
   duplicates; surface follow-ups.
3. **Propose** 2-3 angles when the topic is open (at least one follow-up, one new idea), pulling from
   `references/editorial-backlog.md`.
4. **Load facts** from the `marketing-content` skill; pick the angle from
   `references/audience-messaging.md`.
5. **Draft FR + EN** using the matching template in `references/channel-playbooks.md` and the voice in
   `references/tone-and-voice.md`.
6. **Verify**: both locales native, zero `→`, real numbers, one CTA. Run the self-checks in the
   references.
7. **Save** to the right path; **update** `references/content-inventory.md` and add a `CHANGELOG.md`
   entry under `## [Unreleased]`.
8. **Hand off** out-of-scope work: i18n keys ➜ delegate to translate; meta/sitemap ➜ See skill: seo;
   visuals ➜ delegate to design.

## Routing — read the right reference

| If you need…                                              | Read                               |
| --------------------------------------------------------- | ---------------------------------- |
| Voice, Avoid/Prefer, bilingual discipline                 | `references/tone-and-voice.md`     |
| A template for a post, article, page copy, or README      | `references/channel-playbooks.md`  |
| The persona and the angle that lands                      | `references/audience-messaging.md` |
| What already exists (anti-duplication, follow-ups)        | `references/content-inventory.md`  |
| Ideas for what to write next                              | `references/editorial-backlog.md`  |
| Content that touches SEO, or the daily growth/SEO advisory | `references/content-seo-bridge.md` |

## Evals

Trigger and behavior checks live in `evals/evals.json` (judged via the `skill-creator` loop; no
automated runner). Validate structure with `python3 .claude/skills/claude-anthropic/scripts/audit.py`.
