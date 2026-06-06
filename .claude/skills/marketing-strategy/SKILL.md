---
name: marketing-strategy
description: "Pure-marketing strategy for the Vue SSR Starter Kit (e-xode/vue-ssr): the strategic layer above the content factory, for marketing the open-source MIT kit. Owns global strategy, the no-price monetization model (the kit is free; success = developer adoption that funnels inbound to E-XODE services), campaign planning, channel and social strategy (LinkedIn, GitHub, dev.to, Reddit r/vuejs, npm), positioning and ICP, competitive analysis, and growth/funnel thinking (stars, installs, forks). Decisions persist as references (positioning, pricing, campaigns, gtm, competitive) and are handed to the content agent. Trigger when defining strategy, the monetization stance, planning a campaign, choosing channels, analysing competitors, or reasoning about the adoption funnel. Don't use for: writing the actual posts/articles/README/page copy (→ content agent + content-strategy), product facts (→ marketing-content), i18n keys (→ translate), meta/JSON-LD/sitemap (→ seo), code (→ vue/server), visuals (→ design)."
---

# Marketing strategy — Vue SSR Starter Kit

> The strategic **method** for marketing the open-source kit. This skill owns _what to do and why_:
> positioning, the no-price monetization stance, campaigns, channel mix, competitive analysis, and
> growth. The _facts_ it reasons about live in `marketing-content`; the _content_ that executes its
> decisions is produced by the `content` agent via `content-strategy`. The `marketing` agent loads this
> skill plus `marketing-content`.

## Division of responsibilities

| Concern                                                                       | Where                            |
| ----------------------------------------------------------------------------- | -------------------------------- |
| Strategy, monetization stance, campaigns, channel/GTM, growth, competitive    | `marketing-strategy` (here)      |
| Product facts, stack, features, differentiator, license, repo/npm, assets     | `marketing-content` (the facts)  |
| Editorial workflow, tone/voice, channel playbooks, inventory, backlog         | `content-strategy` (the method)  |
| Producing the posts/articles/README/page copy                                 | ➜ delegate to the content agent  |
| Authoritative stack/versions (runtime source of truth)                        | `package.json`                   |
| i18n keys                                                                      | ➜ delegate to translate          |
| Meta, JSON-LD, hreflang, sitemap                                              | ➜ See skill: seo                 |
| Code changes                                                                  | ➜ delegate to vue / server       |
| Visuals, layout, components                                                   | ➜ delegate to design             |

➜ See skill: marketing-content — the facts this strategy reasons about.
➜ See skill: content-strategy — the editorial method that executes this strategy.

## Core rules

1. **Evidence-led decisions** — every recommendation is backed by real numbers. Stack/version numbers
   come from `package.json`, product facts from `marketing-content`. Never invent.
2. **The kit is free/MIT — never invent a price or paid tier.** Monetization is the adoption-to-services
   funnel, not a SaaS subscription. There is no pricing constant to read or change.
3. **Recommend, never code** — the `marketing` agent persists decisions and hands code/copy/visual
   execution to the right agent. The write surface is `references/*.md`.
4. **Persist every decision** — a recommendation that lives only in a reply is lost. Write it to the
   matching reference with its rationale and date context.
5. **No `→` arrow** in produced strategy artifacts (allowed only inside `.claude/` config).

## Language policy

The kit ships in 2 locales (`SUPPORTED_LOCALES` in `src/shared/const.js`: en, fr). Strategy artifacts
under `references/` are English only. Localized execution (bilingual FR+EN copy) is the content agent's
job, propagated via the translate agent.

## Workflows

### Define or revisit the monetization stance

1. Read `references/pricing.md`. The kit is free/MIT — there is no price or tier.
2. Frame the monetization as the adoption-to-services funnel: which adoption signals (stars, npm
   installs, forks) you optimize and how they bridge to E-XODE consulting inbound.
3. Recommend the stance with funnel rationale; persist to `references/pricing.md`. Never invent a tier.

### Plan a campaign

1. Read `references/positioning.md` (audience) and `references/campaigns.md` (calendar).
2. Define objective, audience, channel, offer, timeline, success metric.
3. Persist the plan to `references/campaigns.md`; hand content to the content agent, visuals to design.

### Set or sharpen positioning

1. Work `references/positioning.md`: ICP, segments, value proposition, differentiation.
2. Cross-check `references/competitive.md` for the one-line differentiation.
3. Recommend the messaging spine; the content agent turns it into FR+EN copy.

## Routing — read the right reference

| If you need…                                              | Read                          |
| --------------------------------------------------------- | ----------------------------- |
| ICP, segments, value proposition, differentiation         | `references/positioning.md`   |
| The monetization stance, the free/services funnel         | `references/pricing.md`        |
| The campaign frame and calendar                            | `references/campaigns.md`      |
| Go-to-market, channel mix, launch sequencing               | `references/gtm.md`            |
| Competitor map, benchmark, watch list                      | `references/competitive.md`    |

## Evals

Trigger and behavior checks live in `evals/evals.json` (judged via the `skill-creator` loop; no
automated runner). Validate structure with `python3 .claude/skills/claude-anthropic/scripts/audit.py`.
