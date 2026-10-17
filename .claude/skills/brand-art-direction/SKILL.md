---
name: brand-art-direction
description: "Screenshot-verification rubric for the Vue SSR Starter Kit (e-xode/vue-ssr): the pre-delivery checklist the visual-qa agent grades rendered PNGs against, and the capture script (screenshots.mjs) that produces them. The visual identity itself lives in DESIGN.md at the repo root. Trigger on: visual QA of rendered views, capturing screenshots, grading hover/focus/reduced-motion states. Don't use for: designing or redesigning a view, picking colors, typography or layout (→ impeccable), SCSS token/mixin mechanics (→ design-scss), Vuetify component API (→ vuetify-components), design routing (→ vue-ssr-design), marketing copy (→ content-strategy)."
---

# Brand Art Direction — screenshot rubric

> The visual charter (palette roles, surfaces, canonical hovers, devices, do's and don'ts) is **`DESIGN.md`** at the repo root, with tokens in its frontmatter and extensions in `.impeccable/design.json`. Product context is `PRODUCT.md`. Design decisions go through the `impeccable` skill, which loads both files. This skill keeps only what they cannot hold: the checklist graded from rendered PNGs and the capture script.

**Golden rule: if you cannot confirm it on a rendered screenshot, it is not done.** The `visual-qa` agent is the authoritative gate; this checklist is its rubric, and `DESIGN.md` is the charter each answer is judged against.

## Capture

```bash
node .claude/skills/brand-art-direction/scripts/screenshots.mjs \
  --routes <changed> --viewports desktop,mobile \
  --hover "<card-selector>" --focus "<cta-selector>"
```

`npm run screenshots` runs the same script. Add `--reduced-motion` for one pass when entrance animations are in scope. Defaults: locale `en`, base `http://localhost:3002`. The script prints the absolute path of every PNG it writes.

## Pre-delivery checklist (every item answered from a screenshot)

1. **Surface rhythm** — are sections quietly distinguishable (hairline or soft shadow), with no loud color band? (`DESIGN.md` → The Two Surfaces Rule)
2. **Sibling hover** — in the first-card vs last-card `:hover` clips of each block, is the treatment identical?
3. **Canonical hover** — does each surface use exactly its archetype's hover (no rogue glow, no lift on a navigation row)?
4. **No dead decoration** — is every intended decorative effect actually visible? Nothing may rely on a global utility class, none of which exists here.
5. **Color roles** — does only indigo read as the brand and call-to-action color, with feedback colors confined to status?
6. **Contrast** — does text on any colored surface pass WCAG AA, in the light and the dark theme?
7. **Reduced motion** — in the `--reduced-motion` capture, are entrance and hover animations static or absent?
8. **Responsive** — at mobile width, any overflow, collapse or broken spacing?
9. **Rendering integrity** — do borders and decorations respect the corner radius? Any clipping, escaped decoration, overlap, clipped focus ring or text overflow? These are bugs regardless of the charter.

Any 🔴/🟠 from `visual-qa` goes back to the `design` agent; fix and re-capture. Done means the PNGs are clean.

## Evolving the charter

Change the identity in `DESIGN.md` and in the single source of the value (`src/styles/variables.scss` or `src/plugins/vuetify.js`), then re-capture every page. Regenerate the sidecar with `/impeccable document` when the code has drifted.
