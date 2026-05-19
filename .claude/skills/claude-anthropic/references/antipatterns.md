# Anti-patterns

Each anti-pattern: **symptom**, **why bad**, **fix**.

## A. `CLAUDE.md`

### A1. Pasting a skill's intro into `CLAUDE.md`

- **Symptom.** A section explaining SSR lifecycle appears in CLAUDE.md.
- **Why bad.** Costs tokens every turn. Duplicates the skill. Drifts.
- **Fix.** Delete. The skill is in the index; loads on demand.

### A2. Tips or FAQ sections

- **Symptom.** "Tip: prefer signals over watchers"
- **Why bad.** Tips are best practices, not hard rules.
- **Fix.** Move to relevant skill.

### A3. Code comments in prose

- **Symptom.** `// Always run npm test` in markdown prose.
- **Why bad.** Violates no-comments rule even in markdown.
- **Fix.** Reword as a sentence.

## B. Skills

### B1. Vague description

- **Symptom.** `"Helps with the project."`
- **Why bad.** Never triggers reliably.
- **Fix.** State domain, file paths, types, trigger keywords, anti-triggers.

### B2. Missing anti-trigger clause

- **Symptom.** Description lists triggers but no `Don't use for:`.
- **Why bad.** Triggers on adjacent topics.
- **Fix.** Append `Don't use for:` naming the alternative.

### B3. Rule lives only in a reference

- **Symptom.** A hard rule is only in `references/`.
- **Why bad.** References may be skipped.
- **Fix.** Surface briefly in `SKILL.md` with a pointer.

### B4. `SKILL.md` is the encyclopedia

- **Symptom.** 1200 lines, 30 examples, no references/.
- **Why bad.** Explodes context.
- **Fix.** Move examples to references/. Aim for ≤ 500 lines.

## C. Sub-agents

### C1. Sub-agent runs validation

- **Symptom.** Agent runs `npm test` after editing.
- **Why bad.** Violates centralized-validation rule.
- **Fix.** Remove. Orchestrator delegates to `hooks`.

### C2. Sub-agent delegates to another

- **Symptom.** One agent calls another agent.
- **Why bad.** Agents stay flat. Only orchestrator delegates.
- **Fix.** Report in structured return; orchestrator decides.

### C3. Out-of-scope edits

- **Symptom.** Agent fixes "while we're at it" bug.
- **Why bad.** Inflates diff, breaks orchestrator's model.
- **Fix.** Report discovery, don't fix.

## D. Rules

### D1. Rule duplicates skill body

- **Symptom.** Rule has 40 lines explaining DynamicReactiveForm.
- **Why bad.** Loads on every matching file. Duplication drifts.
- **Fix.** Keep only the guardrail in the rule. Skill carries knowledge.

### D2. Unconditional rule without justification

- **Symptom.** Rule without `paths:` (loads every turn).
- **Why bad.** Same cost as CLAUDE.md but less discoverable.
- **Fix.** Move to CLAUDE.md or add proper `paths:` glob.

### D3. Rule too large

- **Symptom.** Rule exceeds 2 KB.
- **Why bad.** Should be a skill.
- **Fix.** Extract knowledge to skill. Keep core constraint in rule.

## E. Process

### E1. Global script pool

- **Symptom.** Scripts in `.claude/scripts/` not attached to any skill.
- **Why bad.** No owner, no documentation, drifts.
- **Fix.** Move to owning skill's `scripts/`. Audit.py enforces this.

### E2. Validating after every micro-change

- **Symptom.** Running `npm test` after each edit.
- **Why bad.** Violates centralized-at-task-end rule.
- **Fix.** All changes, then delegate once to hooks.
