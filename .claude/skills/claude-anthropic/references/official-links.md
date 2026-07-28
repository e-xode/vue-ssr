# Official Anthropic documentation

Curated entry points to Anthropic's official documentation. These are the primary sources behind the rules and conventions in this skill.

## Claude Code Overview

- **[Claude Code overview](https://docs.anthropic.com/en/docs/claude-code/overview)** — General introduction to Claude Code: capabilities, supported runtimes, and how it fits into the Anthropic ecosystem.

## Skills

- **[Skills](https://docs.anthropic.com/en/docs/claude-code/skills)** — What skills are, the progressive disclosure model (metadata → SKILL.md → bundled resources), folder layout, authoring guide, triggering descriptions, and best practices.

## Sub-agents

- **[Sub-agents in Claude Code](https://docs.anthropic.com/en/docs/claude-code/sub-agents)** — How sub-agents work, frontmatter, the role of the orchestrator, scoped delegation, and structured returns.

## Hooks

- **[Hooks in Claude Code](https://docs.anthropic.com/en/docs/claude-code/hooks)** — Hook events, JSON config format, blocking semantics, and security model.

## CLAUDE.md / Project memory

- **[CLAUDE.md as project memory](https://docs.anthropic.com/en/docs/claude-code/memory)** — Why `CLAUDE.md` is loaded every turn, recommended structure, path-scoped rules, and the trade-off between context cost and information density.

## Rules

- **[Organize rules with .claude/rules/](https://docs.anthropic.com/en/docs/claude-code/memory#organize-rules-with-claude-rules)** — Path-scoped instructions that load automatically when working on matching files.

## Best Practices

- **[Best practices](https://docs.anthropic.com/en/docs/claude-code/best-practices)** — Writing effective CLAUDE.md files, skills usage guidelines, sub-agent orchestration patterns.

## Doctrine

- **[Building Effective Agents (Anthropic engineering blog)](https://www.anthropic.com/engineering/building-effective-agents)** — Orchestrator-workers pattern, parallelisation, model routing, and when to use agents vs deterministic workflows.
- **[AgentSkills.io](https://agentskills.io)** — Open standard that Claude Code skills follow; covers skill interoperability spec across runtimes and editors.

## Runtime-specific

- **[Claude Code changelog](https://docs.anthropic.com/en/docs/claude-code/changelog)** — Track for skill/agent runtime behaviour changes and new features.
- **[Copilot CLI release notes](https://github.com/github/gh-copilot)** — Track for hook-related fixes.

## How to use this list

1. When a contributor asks "why is the project organised like this?" — point here first, then to [case-studies.md](./case-studies.md).
2. When updating a convention, check whether official guidance has changed.
3. If a URL 404s, mark it `[broken]` and search for the new location before deleting.
