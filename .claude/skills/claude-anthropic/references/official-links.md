# Official Anthropic documentation

Curated entry points to Anthropic's official documentation. These are the primary sources behind the rules and conventions in this skill.

**Host note (verified 2026-08-09).** The Claude Code docs moved twice: `docs.anthropic.com/en/docs/claude-code/<page>` → `docs.claude.com/en/docs/claude-code/<page>` → **`code.claude.com/docs/en/<page>`**. Both older forms still answer with a `301`, so a link check that only looks for `404` will not notice. Every URL below was re-fetched at the new host.

## Claude Code overview

- **[Features overview](https://code.claude.com/docs/en/features-overview)** — which extension mechanism to reach for: CLAUDE.md vs rule vs skill vs subagent vs hook.
- **[Best practices](https://code.claude.com/docs/en/best-practices)** — writing an effective CLAUDE.md, permissioning, workflow patterns.
- **[Changelog](https://code.claude.com/docs/en/changelog)** — track for skill/agent runtime behaviour changes.

## Skills

- **[Skills](https://code.claude.com/docs/en/skills)** — what skills are, progressive disclosure, folder layout, triggering, `/skill-name` invocation, dynamic context injection.
- **[Frontmatter reference](https://code.claude.com/docs/en/skills#frontmatter-reference)** — the authoritative field table. Read this before adding any frontmatter key; the project's [skill-anatomy.md](./skill-anatomy.md) mirrors it but the doc is the source.
- **[Control who invokes a skill](https://code.claude.com/docs/en/skills#control-who-invokes-a-skill)** — `disable-model-invocation` and `user-invocable`, and what each does to the always-loaded listing.
- **[Skill listing budget](https://code.claude.com/docs/en/skills#skills-arent-being-used)** — how the listing is sized, what happens on overflow, and the `skillListingBudgetFraction` / `skillListingMaxDescChars` / `skillOverrides` levers. This is the doc behind the project's always-loaded budget rule.

## Sub-agents

- **[Sub-agents](https://code.claude.com/docs/en/sub-agents)** — how subagents work, the orchestrator's role, scoped delegation.
- **[Supported frontmatter fields](https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields)** — the authoritative field table, mirrored in [agent-anatomy.md](./agent-anatomy.md).
- **[Available tools](https://code.claude.com/docs/en/sub-agents#available-tools)** — allowlist/denylist semantics, and the background-subagent tool filter. **Read this before editing any `tools:` line**: an explicit list is an allowlist, and omitting `Skill` removes the agent's ability to load skills at all.
- **[Preload skills into subagents](https://code.claude.com/docs/en/sub-agents#preload-skills-into-subagents)** — the `skills:` field, which injects full skill content at startup.
- **[What loads at startup](https://code.claude.com/docs/en/sub-agents#what-loads-at-startup)** — a subagent sees CLAUDE.md and rules, but not the parent conversation, not auto memory, and not the skills the parent already loaded.

## CLAUDE.md and memory

- **[Memory](https://code.claude.com/docs/en/memory)** — CLAUDE.md locations and load order, the `@path` import syntax (max depth 4), `CLAUDE.local.md`, `AGENTS.md` interop, auto memory, `claudeMdExcludes`.
- **[Organize rules with .claude/rules/](https://code.claude.com/docs/en/memory#organize-rules-with-claude-rules)** — path-scoped instructions that load automatically on matching files. Confirms `.claude/rules/` is a real Claude Code feature, not a project convention.
- **[Context window](https://code.claude.com/docs/en/context-window)** — what occupies startup context and what survives compaction.

## Settings, permissions, hooks

- **[Settings](https://code.claude.com/docs/en/settings)** — the full `settings.json` key surface, including `skillListingBudgetFraction`.
- **[Permissions](https://code.claude.com/docs/en/permissions)** — permission modes and rule syntax. Note the explicit warning against `bypassPermissions` outside an isolated environment.
- **[Hooks](https://code.claude.com/docs/en/hooks)** — hook events, config format, blocking semantics. The project runs zero hooks ([case-studies.md](./case-studies.md) CS-6); this is here for the decision, not for use.
- **[Tools reference](https://code.claude.com/docs/en/tools-reference)** — canonical tool names, needed to write a correct `tools:` allowlist.

## Plugins

- **[Plugins](https://code.claude.com/docs/en/plugins)** and **[Plugins reference](https://code.claude.com/docs/en/plugins-reference)** — `plugin.json` / `marketplace.json` schemas and what a plugin can ship. Relevant because this repo vendors two Anthropic skills (`skill-creator`, `frontend-design`) from the official marketplace rather than installing them.

## Doctrine

- **[Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)** — orchestrator-workers, parallelisation, model routing, agents vs deterministic workflows.
- **[Agent Skills open standard](https://agentskills.io)** — the cross-runtime spec Claude Code skills follow. Only six frontmatter fields are portable: `name`, `description`, `allowed-tools`, `license`, `metadata`, `compatibility`. Everything else is a Claude Code extension.

## How to use this list

1. When a contributor asks "why is the project organised like this?" — point here first, then to [case-studies.md](./case-studies.md).
2. When updating a convention, check whether official guidance has changed. The frontmatter tables move faster than anything else.
3. If a URL 404s **or redirects**, update it to the target rather than marking it broken. The host has changed twice; assume it can change again.
