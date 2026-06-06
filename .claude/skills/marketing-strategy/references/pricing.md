# Monetization stance — Vue SSR Starter Kit

The durable record of the monetization model and the reasoning behind it. **The kit is free and
MIT-licensed — there is no price and no paid tier.** There is no pricing constant to read or change; the
authoritative product/stack source is `package.json`. This file explains the no-price stance and the
value funnel that replaces a SaaS subscription.

## Model: no price — adoption funnels to services

The kit costs nothing. "Monetization" here is indirect: developer adoption of the open-source kit
creates inbound interest in E-XODE's paid services and consulting. The kit is the top of a services
funnel, not a product with revenue of its own.

| Layer | What it is | What it costs | Role |
| --- | --- | --- | --- |
| The kit | `@e-xode/vue-ssr`, MIT, on npm + GitHub | 0 (free, open) | Acquisition + credibility; proof of E-XODE's engineering |
| The adoption signal | GitHub stars, npm installs, forks | — | The "revenue" metric we optimize for instead of MRR |
| The services bridge | E-XODE consulting / build / support | paid (off-platform) | Where adoption converts to actual revenue |

The value metric is **developer adoption**, not a billable usage unit. There is intentionally no Free
vs Pro split, no seat count, no scan/usage cap — adding one would contradict the MIT, free-forever stance.

## Decisions and rationale

- **The kit stays free/MIT.** A free, readable, production-grade kit is the credibility play; it earns
  trust that a paywall would forfeit. The standout differentiator (the curated Claude Code config) is
  most valuable as a public, copyable example.
- **Success is measured in adoption, not money.** Track stars, npm installs/downloads, and forks as the
  proxy for marketing success. Inbound service enquiries are the conversion event.
- **No invented price.** Never publish, assume, or model a paid tier for the kit. If a future paid
  add-on is ever considered, it is a separate product decision, not a tier on the kit.

## The kit-to-services funnel

1. **Discover** — a developer finds the kit (search, LinkedIn, dev.to, Reddit r/vuejs, npm).
2. **Try** — clones/installs it; the production defaults and AI-ready config build trust.
3. **Adopt** — uses it for a real project; stars/forks it (the adoption signal).
4. **Advocate / enquire** — recommends it, or reaches out to E-XODE for help building on it.

Optimize the early stages with content and channel work (content agent + `gtm.md`); the enquiry handoff
is an E-XODE business action, off-platform.

## Open questions / experiments to consider

- A "used by" / showcase wall to surface adopters and strengthen the services bridge.
- A sponsorship / GitHub Sponsors link as an optional support channel (not a price on the kit).
- Lightweight install/star tracking to make the adoption metric concrete.

Before acting on any of these: frame the trade-off, keep the kit free, recommend, then hand execution to
content (copy) or vue/server (code). Never introduce a paid tier on the kit itself.

## Decision log

- (seed) Free/MIT, no-price stance captured from `package.json` (`"license": "MIT"`) +
  `marketing-content`. Success = adoption (stars/installs/forks) feeding the E-XODE services funnel.
  Update this log if the monetization stance ever changes.
