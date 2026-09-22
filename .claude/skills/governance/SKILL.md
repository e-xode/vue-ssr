---
name: governance
description: "Governance record for this repository's Claude Code configuration: dated audits, case studies, decisions taken and the reasons behind them, orchestration procedures, and notes specific to this project. Trigger when asking why a configuration choice was made here, when a past audit or a settled decision has to be found, or before re-opening a question that was already closed. The audit METHOD and its checks are not here - they come from the deadweight plugin (deadweight:config-auditor). Do not use for running an audit, for writing application code, or for authoring a new skill."
---

# Governance — this repository's configuration decisions

> The audit **method** lives in the `deadweight` plugin (`deadweight:config-auditor`), which also
> ships the checks and `deadweight --fresh`. What lives here is what a plugin cannot carry: the
> decisions **this** repository took, and why.

A plugin is the same bytes in every project that installs it, so it can hold no project's state.
Shipping this repository's case studies inside it would make them false in every other project.
That is why these files stayed behind when the auditor left.

## What is here

| Reference | What it holds |
| --- | --- |
| [`case-studies.md`](./references/case-studies.md) | |
| [`orchestration-procedures.md`](./references/orchestration-procedures.md) | |

## Where the rest went

| | |
| --- | --- |
| Generic doctrine (skill, agent, rule, CLAUDE.md anatomy, anti-patterns, official links) | the plugin's `references/` |
| The auditor and its checks | `deadweight --fresh` |
| The floor and the ratchet | `.claude/audit/floor.json`, committed |
| Exemptions, each with its reason and date | `.claude/audit.local.json` |

## Renamed on 2026-09-22

This skill was called `claude-anthropic`. That name is a **reserved word** for the plugin's check 32, and
the skill no longer does what the name promised: it is a decision record, not a doctrine container.
Both reasons point the same way, so the rename is not a matter of taste.
