# Audience and messaging

Who the kit is for, and the angle that lands for each. Pair this with the facts in the
`marketing-content` skill (stack, features, differentiator) to choose the right proof for the right
reader.

➜ See skill: marketing-content — features and the differentiator referenced below.

## Personas

| Persona                  | Core pain                                                                | Angle that lands                                  | Strongest proof                                      | Best channel                  |
| ------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------- | ---------------------------------------------------- | ----------------------------- |
| Solo dev / indie hacker  | Wants to ship an SSR app fast; auth + i18n + admin are tedious to wire   | "Skip the boilerplate, start at feature one"      | Auth + security codes + admin + i18n already wired   | LinkedIn post, README         |
| Dev team / agency        | Needs a consistent, secure production base across projects               | "A vetted foundation your whole team can reuse"   | Helmet CSP, rate limiting, test suite, Docker + CI   | LinkedIn article, README      |
| Vue dev researching SSR  | SSR setup (entry-server, hydration, locale routing) is fiddly to get right | "A working reference for Vue 3 SSR done properly" | `entry-server.js` meta injection, locale routing     | LinkedIn article, site/landing |
| Technical lead           | Evaluating starting points; wants signal on quality and maintainability  | "Read the conventions before you commit"          | The Claude Code agent/skill fleet, rules, hooks gate | LinkedIn article (credibility) |

## Feature-to-audience map

- **Auth + admin + i18n out of the box** — solo devs and teams who want to skip plumbing.
- **Security + testing + Docker/CI** — agencies and leads who need a defensible, maintainable base.
- **SSR reference implementation** — Vue developers learning or standardizing SSR.
- **The Claude Code config fleet** — the standout, credibility-led angle for technical leads and
  AI-assisted teams: the kit is ready for agentic development, not just a code dump.

## Choosing the angle

1. Identify the reader's pain (column 2), not the feature you want to push.
2. Lead with the angle (column 3); introduce the feature only as the mechanism that resolves the pain.
3. Always attach one concrete proof (column 4) — a real feature, a version, a count.
4. End with the CTA matched to the goal (see the CTA library in `channel-playbooks.md`).
