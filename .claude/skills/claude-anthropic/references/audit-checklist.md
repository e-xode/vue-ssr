# Audit checklist

Each item is tagged `[AUTO]` (covered by `scripts/audit.py` — run it first) or `[MANUAL]` (qualitative — read carefully).

Run the script before manual review:

```bash
python3 .claude/skills/claude-anthropic/scripts/audit.py
```

## `CLAUDE.md`

- `[AUTO]` File size ≤ 10 KB.
- `[AUTO]` No `//` or `/* */` comments outside fenced code blocks.
- `[MANUAL]` Every section is a **hard rule**, not a best practice, tutorial, or example.
- `[MANUAL]` Each agent in `## Agents directory` has a discriminating one-line trigger.
- `[MANUAL]` Skills index is compact (family groupings, not full descriptions).
- `[MANUAL]` No section duplicates content available in a skill.
- `[MANUAL]` "Task completion protocol" still names `validation` as the sole validator, keeps it opt-in, and forbids self-validation.

## Skills (each `SKILL.md`)

- `[AUTO]` Valid YAML frontmatter with `name` and `description`.
- `[AUTO]` `name` in frontmatter matches the folder name.
- `[AUTO]` `description` ≥ 80 characters.
- `[AUTO]` `description` contains an anti-trigger clause (`Don't use`, `Anti-trigger`).
- `[AUTO]` Skill name is unique across `.claude/skills/`.
- `[AUTO]` `SKILL.md` ≤ 50 KB (warn — consider split above this).
- `[AUTO]` All relative links (`./...`) resolve to existing files.
- `[AUTO]` No `//` comments outside fenced code blocks.
- `[MANUAL]` Description is **discriminating** — a different skill cannot match the same query equally well.
- `[MANUAL]` Description is **pushy** — encourages triggering on indirect phrasings.
- `[MANUAL]` Anti-triggers point to the **correct alternative** (skill / agent / framework concept).
- `[MANUAL]` `SKILL.md` is method + index, not encyclopedia (detail lives in `references/`).
- `[MANUAL]` If the skill has a twin, both contain a matching "Division of responsibilities" table.
- `[MANUAL]` Routing table covers all `references/` files (and vice versa).

## References (each `references/*.md`)

- `[MANUAL]` One topic per file. Files > 300 lines have a table of contents.
- `[MANUAL]` No frontmatter (only skills have frontmatter).
- `[MANUAL]` Headings start at `#` (top-level).
- `[MANUAL]` No critical rule lives only here — it must also appear in `SKILL.md`, with a pointer.

## Agents (each `.claude/agents/<name>.md`)

- `[AUTO]` Frontmatter has `name`, `description`, `tools` (block scalars `>`/`|` parse correctly).
- `[AUTO]` Agent is listed in `## Agents directory` of `CLAUDE.md` (and vice versa).
- `[AUTO]` `description` is 80–900 characters and contains an anti-trigger clause.
- `[MANUAL]` Description follows the same discriminating + pushy + anti-trigger rules as skills.
- `[MANUAL]` `tools` is the **minimum** required.
- `[MANUAL]` **Every skill the body tells the agent to load is reachable**: named in `skills:` (preloaded) or `Skill` is present in `tools:`. An explicit `tools:` allowlist without `Skill` disables skill loading silently — see [agent-anatomy.md](./agent-anatomy.md).
- `[MANUAL]` **Two-hop check**: if a preloaded skill itself delegates further (a routing table, a `➜ See skill:` cross-reference, a "Skills to cite" list in its own body or `references/`), the agent needs `Skill` in `tools:` too — preloading only covers the first hop. `audit.py`'s automated check cannot see this (it only detects a literal `## Skills` heading in the agent's own body); it caught the `review` agent missing `Skill` for exactly this reason, found by manual review, not by the script. Don't over-mechanize this: a preloaded skill's own cross-references don't always mean the *agent* needs them — `visual-qa` preloads `brand-art-direction`, whose routing table points at `design-scss`/`vuetify-*` for whoever *implements* a fix, not for `visual-qa`, which only *grades* a render against criteria already inside `brand-art-direction` itself. Judge by what the agent's job actually requires.
- `[MANUAL]` No skill listed in `skills:` sets `disable-model-invocation: true` (preloading such a skill is not possible).
- `[MANUAL]` `model` is a deliberate choice with a one-line rationale in the body, or `inherit`. A hard pin that downgrades an Opus session needs a reason.
- `[MANUAL]` Body restates the sub-agent contract: scoped, no validation (except `validation`), structured return.
- `[MANUAL]` Agent is actually used by the orchestrator — not "kept in case".

## Cross-cutting (whole `.claude/`)

- `[AUTO]` No skill folder lacks a `SKILL.md`.
- `[AUTO]` English-only heuristic (warns on common French function words in skills/references).
- `[AUTO]` No script in top-level `.claude/scripts/` (must live under the owning skill's `scripts/` folder).
- `[AUTO]` Rules in `.claude/rules/` have valid structure (see Rules section below).
- `[AUTO]` Always-loaded budget (CLAUDE.md bytes + all skill descriptions + all agent descriptions) ≤ 43,000 chars (WARN) / 47,000 chars (ERROR); the total prints as INFO on every run.
- `[AUTO]` Every `➜ See skill: <name>` cross-reference resolves to an existing skill.
- `[MANUAL]` No two skills overlap silently (without a "Division of responsibilities" table to disambiguate).
- `[MANUAL]` `Skills index` in `CLAUDE.md` reflects reality (no missing skill, no orphan row).
- `[MANUAL]` Skills follow the project domain-prefix convention (`vue-ssr-*`, `vue3-*`, `vuetify-*`, `design-*`, `marketing-*`).

## Settings (`.claude/settings.json`)

Tracked in git, so it ships to everyone who clones the kit. `audit.py` does not read JSON — these are all manual.

- `[MANUAL]` Every key exists in the [official settings reference](https://code.claude.com/docs/en/settings). An invented key fails silently.
- `[MANUAL]` No `permissions.defaultMode: bypassPermissions` in the **tracked** file. It suppresses prompts including writes to `.git` and `.claude`, on the machine of anyone who clones a public starter kit. Maintainer-only settings belong in an untracked `.claude/settings.local.json`.
- `[MANUAL]` The `permissions.allow` list is not dead config (it is ignored entirely under `bypassPermissions`) and uses the `Tool(pattern)` form where a bare tool name would be too broad.
- `[MANUAL]` No credential, private hostname, or infrastructure detail — the file is public.

## Rules (`.claude/rules/*.md`)

- `[AUTO]` Each rule file is valid markdown (parseable).
- `[AUTO]` If `paths:` frontmatter is present, it contains at least one non-empty glob pattern.
- `[AUTO]` Rule file size ≤ 2 KB (warn — should probably be a skill if larger).
- `[AUTO]` No `//` comments outside fenced code blocks.
- `[AUTO]` English-only heuristic (same as skills).
- `[MANUAL]` **Every `paths:` glob matches at least one file that exists** (`git ls-files | grep`). A glob that matches nothing never fires and never warns — the rule is dead weight that reads as active protection.
- `[MANUAL]` The rule does not carry a constraint that must survive `/compact`; path-scoped rules are not re-injected afterwards.
- `[MANUAL]` Content is a **constraint/guardrail**, not knowledge/procedure.
- `[MANUAL]` Rule does not duplicate content already in a skill body.
- `[MANUAL]` Unconditional rules (no `paths:`) have a justified reason.

## After making changes — required exit

1. Run `python3 .claude/skills/claude-anthropic/scripts/audit.py`. Exit code must be `0` (no errors).
2. Resolve any new `WARN` introduced by the change, or document why it is intentional in `case-studies.md`.
3. Propose any corrections to the user. **Never auto-apply.**
