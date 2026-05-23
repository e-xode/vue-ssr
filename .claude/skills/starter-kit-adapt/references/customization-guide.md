# Customization Guide — Post-Fork Adaptation

> Detailed walkthrough for adapting the Vue SSR Starter Kit Claude configuration to a new project.

## Step 1: Rename project references

### In `CLAUDE.md`

Replace all occurrences of starter-kit identity:

```diff
-# CLAUDE.md — Vue SSR Starter Kit
+# CLAUDE.md — My Project Name

-> Vue 3 + Express SSR starter kit with authentication, i18n, Vuetify 4, admin panel, and MongoDB.
+> Brief description of your project and its tech stack.
```

### In skill descriptions

Each skill description references the project name. Update the project identifier:

```diff
-description: "Architecture reference for the Vue SSR Starter Kit (e-xode/vue-ssr): Vue 3.5 + Vite 7..."
+description: "Architecture reference for MyProject (myorg/myrepo): Vue 3.5 + Vite 7..."
```

### In agent files

Update any agent that references the project by name in its system prompt.

## Step 2: Update dependency versions

Check your `package.json` and update version numbers in skill descriptions:

```bash
node -e "const p=require('./package.json'); console.log(JSON.stringify(p.dependencies, null, 2))"
```

Common version references to update:

| Dependency | Where referenced                             |
| ---------- | -------------------------------------------- |
| `vue`      | `vue-ssr-architecture`, `vue3-composition`   |
| `vite`     | `vue-ssr-architecture`                       |
| `express`  | `vue-ssr-architecture`                       |
| `vuetify`  | `vue-ssr-architecture`, `vuetify-components` |
| `vue-i18n` | `translate`                                  |
| `pinia`    | `vue-ssr-architecture`                       |

## Step 3: Remove inapplicable skills

### Process

1. Delete the skill folder: `rm -rf .claude/skills/<skill-name>/`
2. Remove the entry from the skills index table in `CLAUDE.md`
3. Remove any cross-references in other skills' descriptions (anti-triggers pointing to removed skill)
4. Run `scripts/audit.py` to catch broken references

### Common removal scenarios

**No MongoDB:**

- Remove `.claude/rules/` rule for ObjectId validation
- Update `vue-ssr-architecture` references to remove MongoDB mentions
- Remove `parseObjectId` from shared utilities list in `CLAUDE.md`

**No authentication:**

- Remove `.claude/skills/vue-ssr-auth/`
- Remove auth-related hard rules from `CLAUDE.md`
- Remove security utilities from shared list (`generateSecurityCode`, `findUserSafe`)

**Different UI framework (not Vuetify):**

- Remove `.claude/skills/vuetify-components/`
- Remove `.claude/skills/design-scss/` (if not using SCSS)
- Remove `.claude/skills/design-ux/` or adapt for your framework
- Update `vue-ssr-architecture` to reference your UI framework

## Step 4: Add project-specific skills

### Template for a new domain skill

```markdown
---
name: myproject-domain
description: "Domain knowledge for MyProject (myorg/myrepo): [brief tech/domain summary]. Trigger when: [list trigger scenarios]. Don't use for: [anti-triggers with arrows to correct skills]."
---

# MyProject Domain Knowledge

> One-line purpose statement.

## Core concepts

[Document your domain model, business rules, key entities]

## Patterns

[Document recurring patterns specific to your project]

## References

➜ See [references/topic.md](./references/topic.md) — for detailed reference material.
```

### Naming conventions

- **Domain-specific skills**: Use your project prefix (e.g., `myproject-billing`, `myproject-api`)
- **Cross-cutting skills**: No prefix (e.g., `review`, `translate`)
- Always kebab-case, matching the folder name exactly

## Step 5: Update the agent fleet

### Adding an agent

1. Create `.claude/agents/<agent-name>.md` with system prompt
2. Add entry to fleet table in `CLAUDE.md`
3. Define clear trigger conditions (when to delegate)
4. Specify tools the agent needs access to

### Example: Adding a domain-specific agent

```markdown
| Agent       | Trigger (delegate when…)                    |
| ----------- | ------------------------------------------- |
| `hooks`     | Post-task validation (format → lint → test) |
| `review`    | User asks to review a branch / PR / diff    |
| `migration` | Database migration tasks or schema changes  |
```

### Removing an agent

1. Delete the agent file from `.claude/agents/`
2. Remove from fleet table in `CLAUDE.md`
3. Update any skills that reference the agent in anti-triggers
4. Run `scripts/audit.py`

## Step 6: Update path-scoped rules

### Review existing rules

```bash
ls .claude/rules/
```

Each rule has a `paths:` frontmatter declaring which files it applies to. Remove rules whose paths don't exist in your project.

### Adding a new rule

```markdown
---
paths: ['src/api/**', 'server/**']
---

# API Convention

[Your constraint here — enforced whenever matching files are touched]
```

## Common post-fork scenarios

### Scenario: Changing from MongoDB to PostgreSQL

1. Remove ObjectId validation rule from `.claude/rules/`
2. Remove `parseObjectId` from shared utilities in `CLAUDE.md`
3. Update `vue-ssr-architecture` skill:
   - Replace MongoDB references with PostgreSQL
   - Update database helper patterns
   - Document ORM/query builder conventions
4. Create a new skill (e.g., `myproject-database`) documenting your schema and query patterns
5. Update `vue-ssr-auth` if kept — replace MongoDB session store references

### Scenario: Adding locales (e.g., adding German)

1. Create `src/translate/de.json` — copy structure from `en.json`, translate values
2. Update `translate` skill description: `"2-locale system (EN/FR)"` → `"3-locale system (EN/FR/DE)"`
3. Update route regex in `vue-ssr-architecture` references:
   ```diff
   -/:locale(en|fr)/
   +/:locale(en|fr|de)/
   ```
4. Update `useLocalePath` composable if it has hardcoded locale list
5. Verify with `npm run test:run` that locale routing works

### Scenario: Different UI framework (e.g., replacing Vuetify with PrimeVue)

1. Remove skills: `vuetify-components`, `design-scss`, `design-ux`
2. Create replacement skills:
   - `myproject-primevue` — component patterns, theming, form building
   - `myproject-styles` — your CSS/styling approach
3. Update `vue-ssr-architecture`:
   - Replace Vuetify references with PrimeVue
   - Update SSR instantiation notes (plugin registration differs)
4. Update `CLAUDE.md` hard rules:
   - Remove "SCSS externalized" if not using SCSS
   - Add your styling conventions

### Scenario: Removing i18n entirely

1. Remove `.claude/skills/translate/`
2. Remove i18n hard rule from `CLAUDE.md` ("i18n mandatory")
3. Update `vue-ssr-architecture` to remove locale routing references
4. Remove locale-related entries from shared utilities list

## Validation

After all changes, run the full audit:

```bash
python scripts/audit.py
```

This checks:

- All skills in `CLAUDE.md` index have corresponding folders
- All skill folders are listed in `CLAUDE.md` index
- Cross-references between skills point to existing skills
- Agent fleet table matches agent files
- No orphaned references

Fix any issues reported, then run again until clean.
