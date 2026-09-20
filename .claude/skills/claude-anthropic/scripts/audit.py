#!/usr/bin/env python3
"""Audit the Claude configuration of this repository.

CANONICAL FILE - DO NOT EDIT IN PLACE.
This file is identical in every repository of the fleet. It is generated from
cbragard.llm/.claude/skills/fleet-propagation/reference/audit.py by
`fleet-propagation/scripts/converger-audit.py`. Editing one copy makes the fleet diverge again: change the
reference and redeploy. Verify with:
    sha1sum */.claude/skills/claude-anthropic/scripts/audit.py | cut -c1-8 | sort -u | wc -l
It must print 1.

Anything genuinely local (English-only exemptions, for instance) lives beside
this file in `audit.local.json`, which is NOT generated and stays per repository.


Runs the mechanical checks listed in CHECKS against CLAUDE.md, skills
(.claude/skills/), agents (.claude/agents/), rules (.claude/rules/), settings
(.claude/settings*.json) and eval suites (.claude/skills/*/evals/evals.json),
reporting OK/INFO/WARN/ERROR. Most checks emit a finding only on failure; a
clean run prints the executed-count summary so success stays legible. Exits 1
on any error.

Beyond file hygiene the script verifies the mechanisms behind the
configuration: that rule `paths:` globs expand to real files, that agent
frontmatter names tools and preloadable skills that exist, that no reference
file is reachable only from a sibling reference, that every eval suite matches
the documented schema, and that twin skills carry both halves of their
division-of-responsibilities table — the heading, a row owned by the twin,
and a shared row whose concern text reads identically on both sides.

Usage:
    python3 .claude/skills/claude-anthropic/scripts/audit.py
    python3 .claude/skills/claude-anthropic/scripts/audit.py --json
    python3 .claude/skills/claude-anthropic/scripts/audit.py --root /path/to/repo

No external dependencies (Python stdlib only). No --fix flag: corrections are
always proposed to the user, never applied automatically.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Iterable

# ---------------------------------------------------------------------------
# THRESHOLDS - identical in every repository. Three tiers, and the tier decides
# whether a number is negotiable.
#
# 1. MECHANISM - imposed by the runtime. Not a choice; changing it only makes the
#    audit lie about what the model actually does.
DESCRIPTION_MAX_CHARS = 1536          # description + when_to_use are truncated at 1,536 chars
                                      # in the skill listing. Past it the text is silently lost.
                                      # https://code.claude.com/docs/en/skills.md
                                      # Decision 2026-09-20: ONE threshold, the documented one.
                                      # The repository-local 1,024 figure was a proxy for "do not
                                      # write a catalogue"; that property is now measured directly
                                      # by cbragard.llm's anatomie-description.py (trigger /
                                      # anti-trigger / catalogue split), which a character count
                                      # never captured.
SKILL_MD_COMPACTION_WARN_BYTES = 20000  # ~5,000 tokens: content past this point is
                                        # dropped when a skill is re-attached after
                                        # auto-compaction.
#
# 2. HOUSE DOCTRINE - deliberate discipline, uniform across the fleet because no
#    mechanism makes one repository deserve more room than another.
DESCRIPTION_MIN_CHARS = 80
AGENT_DESCRIPTION_MAX_CHARS = 900
CLAUDE_MD_MAX_BYTES = 12 * 1024
CLAUDE_MD_MAX_LINES = 200
SKILL_MD_ERROR_BYTES = 50 * 1024
REFERENCE_WARN_LINES = 300
REFERENCE_TOC_LINES = 100
REFERENCE_TOC_SCAN_LINES = 30
ALWAYS_LOADED_WARN_CHARS = 43000
ALWAYS_LOADED_ERROR_CHARS = 47000
SKILL_DESC_AGGREGATE_WARN_CHARS = 40000
EVALS_MIN_COUNT = 3
#
# 3. DERIVED - computed from this repository's own settings, so the NUMBER differs
#    between repositories while the RULE stays the same. `skillListingBudgetFraction`
#    is a per-repository dial (measured 2026-09-20: 0.025 in eight repos, 0.05 in
#    sg.cophy-frontend, 0.06 in sg.focus-frontend). Hard-coding one ceiling across
#    repositories that set different fractions would uniformise the wrong thing.
LISTING_FRACTION_DEFAULT = 0.01       # harness default: 1% of the context window
CONTEXT_WINDOW_TOKENS = 1_000_000     # the window this fleet actually runs on
CHARS_PER_TOKEN = 4                   # rough, and stated as rough
# ---------------------------------------------------------------------------

CHECKS = (
    "claude-md size + code-comments",
    "skill SKILL.md exists + frontmatter",
    "skill name matches folder",
    "skill description length + anti-trigger",
    "skill SKILL.md size",
    "skill duplicate name",
    "skill broken relative links",
    "agent frontmatter (name/description/tools)",
    "agent description budget + anti-trigger",
    "agent <-> CLAUDE.md cross-refs",
    "english-only heuristic (skills + src content)",
    "no code comments in SKILL.md",
    "no global scripts pool",
    "rules structure (size/paths/comments/english)",
    "skill-index <-> folder coherence",
    "reference file size + table of contents",
    "always-loaded context budget",
    "see-skill cross-reference targets",
    "frontmatter scalar quoting (strict-YAML safety)",
    "relative links resolve across the whole .claude tree",
    "SKILL.md compaction re-attach slice",
    "rule paths globs expand to real files",
    "agent frontmatter validity (tools / skills preload / model)",
    "settings.json scope semantics",
    "orphan references (unreachable from SKILL.md)",
    "evals schema + coverage",
    "twin-skill division-of-responsibilities tables (heading, twin row, shared row text)",
    "skill anchors resolve to real files (falsifiability)",
    "listing budget derived from skillListingBudgetFraction",
)
FRENCH_HEURISTIC_WORDS = {
    "avec", "pour", "dans", "cette", "celui", "celle", "ceux", "celles",
    "vous", "nous", "etre", "tres", "donc", "ainsi",
    "depuis", "toujours", "jamais", "ensuite", "alors", "parce", "lorsque",
    "fichier", "exemple", "doit", "peut", "faut", "selon",
}
FRENCH_HEURISTIC_THRESHOLD = 3
ENGLISH_ONLY_EXEMPT: set[str] = set()   # filled from audit.local.json, see below
ENGLISH_ONLY_SUFFIX_EXEMPT = ".fr.md"

KNOWN_TOOLS = {
    "Read", "Edit", "Write", "Glob", "Grep", "Bash", "PowerShell", "Skill", "Agent",
    "WebFetch", "WebSearch", "NotebookEdit", "TodoWrite", "ToolSearch", "Monitor",
    "SendMessage", "TaskStop", "TaskOutput", "EnterWorktree", "ExitWorktree",
    "AskUserQuestion",
}
KNOWN_MODEL_TIERS = {"haiku", "sonnet", "opus", "inherit"}
AGENT_VALIDATED_KEYS = {"name", "description", "tools", "model", "skills"}
PROJECT_SCOPE_IGNORED_MODES = {"bypassPermissions", "auto"}

WALK_PRUNE_DIRS = {
    ".git", "node_modules", "dist", "build", "coverage", ".venv", "venv",
    "__pycache__", ".cache", ".output", ".next", ".nuxt", "out",
}

EVALS_REQUIRED_KEYS = ("id", "prompt", "expected_output", "expectations")
EVALS_ANTI_NAME_TOKENS = ("anti-trigger", "not-trigger", "should-not", "defer", "negative", "near-miss")
EVALS_ANTI_EXPECTATION_TOKENS = ("defer", "does not trigger", "should not")

DIVISION_HEADING_RE = re.compile(r"^#{1,6}\s+.*division of responsibilities", re.IGNORECASE | re.MULTILINE)
POINTER_RE = re.compile(r"→\s*([a-z0-9][a-z0-9-]*)")

SEVERITY_ORDER = {"OK": 0, "INFO": 1, "WARN": 2, "ERROR": 3}


def load_local_config() -> dict:
    """Per-repository exceptions. This is the ONLY thing that may differ.

    `audit.local.json`, beside this script. Recognised keys:
        english_only_exempt : list of skill-relative paths exempt from the
                              English-only heuristic (translation glossaries).
    Absent file, unreadable file or bad JSON: no exemption, and the audit says so.
    """
    path = Path(__file__).resolve().parent / "audit.local.json"
    if not path.is_file():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except (json.JSONDecodeError, UnicodeDecodeError, OSError):
        return {"__error__": str(path)}


_LOCAL = load_local_config()
ENGLISH_ONLY_EXEMPT = set(_LOCAL.get("english_only_exempt") or ())


@dataclass
class Finding:
    check: str
    severity: str
    message: str
    location: str = ""


@dataclass
class Report:
    findings: list[Finding] = field(default_factory=list)

    def add(self, check: str, severity: str, message: str, location: str = "") -> None:
        self.findings.append(Finding(check, severity, message, location))

    def has_errors(self) -> bool:
        return any(f.severity == "ERROR" for f in self.findings)

    def counts(self) -> dict[str, int]:
        c = {"OK": 0, "INFO": 0, "WARN": 0, "ERROR": 0}
        for f in self.findings:
            c[f.severity] = c.get(f.severity, 0) + 1
        return c


BLOCK_SCALAR_INDICATORS = {">", ">-", ">+", "|", "|-", "|+"}


def parse_frontmatter(text: str) -> tuple[dict[str, str] | None, int]:
    if not text.startswith("---"):
        return None, 0
    lines = text.splitlines()
    end = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end = i
            break
    if end is None:
        return None, 0
    data: dict[str, str] = {}
    current_key: str | None = None
    buf: list[str] = []
    block_style: str | None = None

    def flush() -> None:
        nonlocal buf, block_style
        if current_key is None:
            return
        if block_style == ">":
            value = " ".join(part for part in (s.strip() for s in buf) if part)
        else:
            value = "\n".join(buf).strip()
        data[current_key] = value.strip().strip('"').strip("'").replace("''", "'")
        buf = []
        block_style = None

    for raw in lines[1:end]:
        if re.match(r"^[A-Za-z_][A-Za-z0-9_-]*\s*:", raw):
            flush()
            key, _, value = raw.partition(":")
            current_key = key.strip()
            scalar = value.strip()
            if scalar in BLOCK_SCALAR_INDICATORS:
                block_style = scalar[0]
            else:
                buf.append(scalar)
        else:
            buf.append(raw.strip())
    flush()
    return data, end + 1


def strip_code_fences(text: str) -> str:
    text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
    text = re.sub(r"`[^`\n]+`", "", text)
    return text


def iter_relative_links(text: str) -> Iterable[tuple[str, int]]:
    for m in re.finditer(r"\]\((\.[^)\s]+)", text):
        link = m.group(1)
        link = link.split("#", 1)[0]
        if link:
            yield link, m.start()


def frontmatter_keys(text: str) -> list[str]:
    """Top-level frontmatter keys, in file order."""
    if not text.startswith("---"):
        return []
    lines = text.splitlines()
    end = next((i for i in range(1, len(lines)) if lines[i].strip() == "---"), None)
    if end is None:
        return []
    keys: list[str] = []
    for raw in lines[1:end]:
        m = re.match(r"^([A-Za-z_][A-Za-z0-9_-]*)\s*:", raw)
        if m and m.group(1) not in keys:
            keys.append(m.group(1))
    return keys


def frontmatter_list(value: str) -> list[str]:
    """Split a frontmatter scalar into items, block-list or inline-list alike."""
    value = value.strip()
    if not value:
        return []
    if value.startswith("[") and value.endswith("]"):
        raw_items = value[1:-1].split(",")
    elif "\n" in value or value.lstrip().startswith("- "):
        raw_items = value.splitlines()
    else:
        raw_items = value.split(",")
    items = []
    for raw in raw_items:
        item = raw.strip()
        if item.startswith("- "):
            item = item[2:]
        item = item.strip().strip("'").strip('"').strip()
        if item:
            items.append(item)
    return items


def repo_files(root: Path) -> list[str]:
    """Every repo-relative file path, minus build output and vendored trees.

    Dependency and build directories are pruned deliberately: a rule glob whose
    only matches live in `node_modules/` guards nothing the project writes, so
    counting those matches would hide exactly the inert globs check 22 exists
    to find.
    """
    files: list[str] = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = sorted(d for d in dirnames if d not in WALK_PRUNE_DIRS)
        rel = os.path.relpath(dirpath, root)
        prefix = "" if rel == "." else rel.replace(os.sep, "/") + "/"
        for name in sorted(filenames):
            files.append(prefix + name)
    return files


def expand_braces(pattern: str) -> list[str]:
    """Expand `{a,b}` alternatives into one pattern per branch."""
    m = re.search(r"\{([^{}]*)\}", pattern)
    if not m:
        return [pattern]
    head, tail = pattern[: m.start()], pattern[m.end() :]
    expanded: list[str] = []
    for option in m.group(1).split(","):
        expanded.extend(expand_braces(head + option + tail))
    return expanded


def glob_to_regex(pattern: str) -> re.Pattern[str]:
    """Compile one brace-free glob, with `**` spanning path segments."""
    segments = pattern.split("/")
    out: list[str] = []
    for index, segment in enumerate(segments):
        last = index == len(segments) - 1
        if segment == "**":
            out.append(".*" if last else "(?:.*/)?")
            continue
        compiled = ""
        pos = 0
        while pos < len(segment):
            char = segment[pos]
            if char == "*":
                compiled += "[^/]*"
            elif char == "?":
                compiled += "[^/]"
            elif char == "[":
                close = segment.find("]", pos + 1)
                if close == -1:
                    compiled += re.escape(char)
                else:
                    body = segment[pos + 1 : close]
                    compiled += "[" + ("^" + body[1:] if body.startswith("!") else body) + "]"
                    pos = close
            else:
                compiled += re.escape(char)
            pos += 1
        out.append(compiled if last else compiled + "/")
    return re.compile("^" + "".join(out) + "$")


def glob_match_count(pattern: str, files: Iterable[str]) -> int:
    files = list(files)
    matched: set[str] = set()
    for branch in expand_braces(pattern):
        regex = glob_to_regex(branch)
        matched.update(path for path in files if regex.match(path))
    return len(matched)


def check_claude_md(root: Path, report: Report) -> None:
    path = root / "CLAUDE.md"
    if not path.exists():
        report.add("01-claude-md-exists", "ERROR", "CLAUDE.md not found", str(path))
        return
    size = path.stat().st_size
    if size > CLAUDE_MD_MAX_BYTES:
        report.add(
            "01-claude-md-size",
            "ERROR",
            f"CLAUDE.md is {size} bytes (max {CLAUDE_MD_MAX_BYTES}). Move knowledge to skills.",
            str(path),
        )
    else:
        report.add("01-claude-md-size", "OK", f"CLAUDE.md size {size} bytes <= {CLAUDE_MD_MAX_BYTES}.", str(path))

    text = path.read_text(encoding="utf-8")
    stripped = strip_code_fences(text)
    if re.search(r"^\s*//", stripped, re.MULTILINE) or re.search(r"/\*[^!]", stripped):
        report.add(
            "12-no-code-comments",
            "WARN",
            "CLAUDE.md contains // or /* */ outside fenced code blocks.",
            str(path),
        )


def check_skills(root: Path, report: Report) -> dict[str, dict]:
    skills_dir = root / ".claude" / "skills"
    if not skills_dir.is_dir():
        report.add("02-skills-dir", "ERROR", ".claude/skills/ not found", str(skills_dir))
        return {}
    skills: dict[str, dict] = {}
    seen_names: dict[str, str] = {}
    for entry in sorted(skills_dir.iterdir()):
        if not entry.is_dir():
            continue
        skill_md = entry / "SKILL.md"
        if not skill_md.exists():
            report.add(
                "02-skill-md-exists",
                "ERROR",
                f"Skill folder '{entry.name}' has no SKILL.md",
                str(entry),
            )
            continue
        text = skill_md.read_text(encoding="utf-8")
        fm, _ = parse_frontmatter(text)
        if not fm:
            report.add(
                "02-skill-frontmatter",
                "ERROR",
                f"SKILL.md in '{entry.name}' has no valid YAML frontmatter",
                str(skill_md),
            )
            continue
        name = fm.get("name", "").strip()
        desc = fm.get("description", "").strip()
        if not name:
            report.add("02-skill-frontmatter", "ERROR", "Missing 'name' in frontmatter", str(skill_md))
        if not desc:
            report.add("02-skill-frontmatter", "ERROR", "Missing 'description' in frontmatter", str(skill_md))

        if name and name != entry.name:
            report.add(
                "03-skill-name-matches-folder",
                "ERROR",
                f"Frontmatter name '{name}' does not match folder '{entry.name}'",
                str(skill_md),
            )

        if desc and desc[0] in (">", "|"):
            report.add(
                "02-frontmatter-block-scalar",
                "ERROR",
                f"Skill '{entry.name}' description parsed as a raw block-scalar indicator — frontmatter parser failed.",
                str(skill_md),
            )

        if desc:
            if len(desc) < DESCRIPTION_MIN_CHARS:
                report.add(
                    "04-skill-description-length",
                    "WARN",
                    f"Skill '{entry.name}' description is only {len(desc)} chars (min {DESCRIPTION_MIN_CHARS})",
                    str(skill_md),
                )
            if len(desc) > DESCRIPTION_MAX_CHARS:
                report.add(
                    "04-skill-description-length",
                    "WARN",
                    f"Skill '{entry.name}' description is {len(desc)} chars (> {DESCRIPTION_MAX_CHARS}). "
                    "The listing truncates 'description' + 'when_to_use' at 1,536 chars: everything "
                    "past that point is dropped without a warning, so the tail of the description "
                    "never reaches the model.",
                    str(skill_md),
                )
            if not re.search(r"Don'?t use|Anti-?trigger", desc, re.IGNORECASE):
                report.add(
                    "04-skill-description-antitrigger",
                    "WARN",
                    f"Skill '{entry.name}' description has no anti-trigger clause",
                    str(skill_md),
                )

        size = skill_md.stat().st_size
        vendored = is_vendored_skill(entry)
        if size > SKILL_MD_ERROR_BYTES:
            report.add(
                "05-skill-md-size",
                "INFO" if vendored else "ERROR",
                f"SKILL.md in '{entry.name}' is {size} bytes (> {SKILL_MD_ERROR_BYTES}). Split it."
                + (" Vendored skill — reported for information only." if vendored else ""),
                str(skill_md),
            )
        elif size > SKILL_MD_COMPACTION_WARN_BYTES:
            report.add(
                "21-skill-md-compaction",
                "INFO" if vendored else "WARN",
                f"SKILL.md in '{entry.name}' is {size} bytes (> {SKILL_MD_COMPACTION_WARN_BYTES}, "
                "roughly 5,000 tokens): content past ~5,000 tokens is dropped after the first "
                "auto-compaction; move detail to references."
                + (" Vendored skill — reported for information only." if vendored else ""),
                str(skill_md),
            )

        if name and name in seen_names:
            report.add(
                "06-skill-duplicate-name",
                "ERROR",
                f"Duplicate skill name '{name}' (also in '{seen_names[name]}')",
                str(skill_md),
            )
        elif name:
            seen_names[name] = entry.name

        for link, _ in iter_relative_links(text):
            target = (skill_md.parent / link).resolve()
            try:
                target.relative_to(skill_md.parent.resolve())
            except ValueError:
                continue
            if not target.exists():
                report.add(
                    "07-skill-broken-link",
                    "ERROR",
                    f"SKILL.md in '{entry.name}' links to non-existent '{link}'",
                    str(skill_md),
                )

        skills[entry.name] = {
            "name": name,
            "description": desc,
            "path": str(skill_md),
            "disable-model-invocation": fm.get("disable-model-invocation", ""),
            "user-invocable": fm.get("user-invocable", ""),
            "paths": fm.get("paths", ""),
        }
    return skills


def check_agents(root: Path, report: Report) -> dict[str, dict]:
    agents_dir = root / ".claude" / "agents"
    if not agents_dir.is_dir():
        report.add("08-agents-dir", "WARN", ".claude/agents/ not found", str(agents_dir))
        return {}
    agents: dict[str, dict] = {}
    for entry in sorted(agents_dir.iterdir()):
        if not entry.is_file() or entry.suffix != ".md":
            continue
        text = entry.read_text(encoding="utf-8")
        fm, _ = parse_frontmatter(text)
        if not fm:
            report.add(
                "08-agent-frontmatter",
                "ERROR",
                f"Agent '{entry.stem}' has no valid YAML frontmatter",
                str(entry),
            )
            continue
        missing = [k for k in ("name", "description", "tools") if not fm.get(k)]
        if missing:
            report.add(
                "08-agent-frontmatter",
                "ERROR",
                f"Agent '{entry.stem}' missing required keys: {', '.join(missing)}",
                str(entry),
            )
        desc = fm.get("description", "").strip()
        if desc and desc[0] in (">", "|"):
            report.add(
                "02-frontmatter-block-scalar",
                "ERROR",
                f"Agent '{entry.stem}' description parsed as a raw block-scalar indicator — frontmatter parser failed.",
                str(entry),
            )
        agents[entry.stem] = {"name": fm.get("name", ""), "description": desc, "path": str(entry)}
    return agents


def check_agent_descriptions(report: Report, agents: dict[str, dict]) -> None:
    for name, meta in agents.items():
        desc = meta.get("description", "")
        if not desc:
            continue
        if len(desc) < DESCRIPTION_MIN_CHARS:
            report.add(
                "08b-agent-description",
                "WARN",
                f"Agent '{name}' description is only {len(desc)} chars (min {DESCRIPTION_MIN_CHARS})",
                meta["path"],
            )
        if len(desc) > AGENT_DESCRIPTION_MAX_CHARS:
            report.add(
                "08b-agent-description",
                "WARN",
                f"Agent '{name}' description is {len(desc)} chars (> {AGENT_DESCRIPTION_MAX_CHARS}). Description = trigger surface; move knowledge to the body.",
                meta["path"],
            )
        if not re.search(r"Don'?t use|Anti-?trigger", desc, re.IGNORECASE):
            report.add(
                "08b-agent-description",
                "WARN",
                f"Agent '{name}' description has no anti-trigger clause",
                meta["path"],
            )


def listing_hidden_skills(root: Path, skills: dict[str, dict]) -> set[str]:
    """Skills whose description is NOT paid for in the per-turn skill listing.

    Three mechanisms withhold a description: `disable-model-invocation: true` in
    the skill's own frontmatter, a `skillOverrides` entry in
    `.claude/settings.json` set to anything other than "on", and a non-empty
    `paths:` frontmatter list. The last one is not documented as a withholding
    mechanism by Anthropic, but it was measured twice on this project — headless
    on 2026-09-03, interactive on 2026-09-09 — to remove the skill from the
    listing entirely (name and description) and to make it uninvocable by name,
    with no auto-load and no next-turn offer when a matching file is touched.
    The pilot was closed on 2026-09-09 and no skill carries `paths:` any more;
    this branch is kept as a regression guard, so that a re-added `paths:`
    surfaces as "withheld but not named in the Skills index" instead of a
    silently unreachable skill.
    See claude-anthropic/references/skill-runtime-mechanisms.md.

    All three are invisible to a naive character count, which is why the budget
    is reported twice.
    """
    hidden = {
        name
        for name, data in skills.items()
        if str(data.get("disable-model-invocation", "")).strip().lower() == "true"
        or frontmatter_list(data.get("paths", ""))
    }
    settings = root / ".claude" / "settings.json"
    if settings.is_file():
        try:
            overrides = json.loads(settings.read_text(encoding="utf-8")).get("skillOverrides", {})
        except (json.JSONDecodeError, UnicodeDecodeError):
            overrides = {}
        for name, state in overrides.items():
            if name in skills and str(state).strip().lower() != "on":
                hidden.add(name)
    return hidden


def check_always_loaded_budget(
    root: Path, report: Report, skills: dict[str, dict], agents: dict[str, dict]
) -> None:
    claude_md = root / "CLAUDE.md"
    claude_md_bytes = claude_md.stat().st_size if claude_md.exists() else 0
    hidden = listing_hidden_skills(root, skills)
    raw_skill_chars = sum(len(s.get("description", "")) for s in skills.values())
    skill_chars = sum(
        len(s.get("description", "")) for name, s in skills.items() if name not in hidden
    )
    agent_chars = sum(len(a.get("description", "")) for a in agents.values())
    total = claude_md_bytes + skill_chars + agent_chars
    suppressed = raw_skill_chars - skill_chars
    detail = (
        f" [{len(hidden)} skill(s) withheld from the listing: {suppressed} chars not paid; "
        f"raw skill total {raw_skill_chars}]"
        if hidden
        else ""
    )
    message = (
        f"Always-loaded context: {total} chars "
        f"(CLAUDE.md {claude_md_bytes} B + skill descriptions {skill_chars} + agent descriptions {agent_chars})."
        f"{detail}"
    )
    if total > ALWAYS_LOADED_ERROR_CHARS:
        report.add(
            "17-always-loaded-budget",
            "ERROR",
            f"{message} Exceeds the hard budget ({ALWAYS_LOADED_ERROR_CHARS}). Trim descriptions or CLAUDE.md.",
            str(claude_md),
        )
    elif total > ALWAYS_LOADED_WARN_CHARS:
        report.add(
            "17-always-loaded-budget",
            "WARN",
            f"{message} Above the target budget ({ALWAYS_LOADED_WARN_CHARS}).",
            str(claude_md),
        )
    else:
        report.add("17-always-loaded-budget", "INFO", message, str(claude_md))
    if skill_chars > SKILL_DESC_AGGREGATE_WARN_CHARS:
        report.add(
            "17-always-loaded-budget",
            "WARN",
            f"Skill descriptions alone total {skill_chars} chars (> {SKILL_DESC_AGGREGATE_WARN_CHARS}): "
            "approaching the harness listing budget. `.claude/settings.json` sets "
            "`skillListingBudgetFraction: 0.025`, scaling the ~23.1k-23.5k cutoff observed on "
            "2026-07-19 at the 0.01 default to roughly 58k chars. Trim descriptions rather than "
            "raising this ratchet again; the next raise needs a fresh runtime measurement.",
            str(claude_md),
        )


def check_see_skill_targets(root: Path, report: Report, skills: dict[str, dict]) -> None:
    if not skills:
        return
    targets: list[Path] = []
    for sub in ("skills", "agents", "rules"):
        base = root / ".claude" / sub
        if base.is_dir():
            targets.extend(sorted(base.rglob("*.md")))
    for path in targets:
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for m in re.finditer(r"➜\s*See skill:\s*([a-z0-9][a-z0-9-]*)", text):
            name = m.group(1)
            if name not in skills:
                report.add(
                    "18-see-skill-target",
                    "ERROR",
                    f"Cross-reference '➜ See skill: {name}' points to a non-existent skill.",
                    str(path),
                )


def check_cross_refs(
    root: Path, report: Report, skills: dict[str, dict], agents: dict[str, dict]
) -> None:
    claude_md = root / "CLAUDE.md"
    if not claude_md.exists():
        return
    text = claude_md.read_text(encoding="utf-8")

    referenced_agents: set[str] = set()
    agents_table_match = re.search(
        r"##\s+Agents directory.*?(?=^##\s|\Z)", text, re.DOTALL | re.MULTILINE
    )
    if agents_table_match:
        block = agents_table_match.group(0)
        for m in re.finditer(r"\|\s*`([a-z0-9-]+)`\s*\|", block):
            referenced_agents.add(m.group(1))

    for agent_name in agents:
        if agent_name not in referenced_agents:
            report.add(
                "09-agent-in-claude-md",
                "ERROR",
                f"Agent '{agent_name}' exists in .claude/agents/ but is not listed in CLAUDE.md 'Agents directory'",
                str(claude_md),
            )
    for ref in referenced_agents:
        if ref not in agents:
            report.add(
                "09-claude-md-agent-missing",
                "ERROR",
                f"CLAUDE.md references agent '{ref}' but .claude/agents/{ref}.md does not exist",
                str(claude_md),
            )


def check_english_only(root: Path, report: Report) -> None:
    targets: list[Path] = []
    skills_dir = root / ".claude" / "skills"
    if skills_dir.is_dir():
        for skill in skills_dir.iterdir():
            if not skill.is_dir():
                continue
            for p in skill.rglob("*.md"):
                if p.name.endswith(ENGLISH_ONLY_SUFFIX_EXEMPT):
                    continue
                if p.relative_to(skills_dir).as_posix() in ENGLISH_ONLY_EXEMPT:
                    continue
                targets.append(p)
    src_dir = root / "src"
    if src_dir.is_dir():
        translate_dir = src_dir / "translate"
        for pattern in ("*.md", "*.txt"):
            for p in src_dir.rglob(pattern):
                if p.name.endswith(ENGLISH_ONLY_SUFFIX_EXEMPT):
                    continue
                if translate_dir not in p.parents:
                    targets.append(p)
    for path in targets:
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        stripped = strip_code_fences(text).lower()
        words = re.findall(r"[a-zàâçéèêëîïôûùüÿñæœ']+", stripped)
        hits = sum(1 for w in words if w in FRENCH_HEURISTIC_WORDS)
        if hits >= FRENCH_HEURISTIC_THRESHOLD:
            report.add(
                "11-english-only",
                "WARN",
                f"File appears to contain French content ({hits} heuristic hits).",
                str(path),
            )


def check_no_code_comments_in_skills(root: Path, report: Report) -> None:
    skills_dir = root / ".claude" / "skills"
    if not skills_dir.is_dir():
        return
    for skill_md in skills_dir.glob("*/SKILL.md"):
        text = skill_md.read_text(encoding="utf-8")
        stripped = strip_code_fences(text)
        if re.search(r"^\s*//", stripped, re.MULTILINE):
            report.add(
                "12-no-code-comments",
                "WARN",
                "SKILL.md contains // comment outside fenced code block",
                str(skill_md),
            )


def check_no_global_scripts(root: Path, report: Report) -> None:
    global_scripts = root / ".claude" / "scripts"
    if not global_scripts.exists():
        return
    files = [p for p in global_scripts.rglob("*") if p.is_file()]
    if not files:
        return
    for path in files:
        report.add(
            "13-no-global-scripts",
            "ERROR",
            f"Script '{path.name}' lives in .claude/scripts/ (global pool). Move it to its owning skill: .claude/skills/<owner>/scripts/{path.name}.",
            str(path),
        )


RULE_MAX_BYTES = 2048


def check_rules(root: Path, report: Report) -> None:
    rules_dir = root / ".claude" / "rules"
    if not rules_dir.is_dir():
        return
    for entry in sorted(rules_dir.iterdir()):
        if not entry.is_file() or entry.suffix != ".md":
            continue
        text = entry.read_text(encoding="utf-8")
        size = entry.stat().st_size

        if size > RULE_MAX_BYTES:
            report.add(
                "14-rule-size",
                "WARN",
                f"Rule '{entry.name}' is {size} bytes (> {RULE_MAX_BYTES}). Consider converting to a skill.",
                str(entry),
            )

        fm, _ = parse_frontmatter(text)
        if fm is not None:
            paths_val = fm.get("paths", "").strip()
            if not paths_val:
                report.add(
                    "14-rule-no-paths",
                    "WARN",
                    f"Rule '{entry.name}' has frontmatter but no 'paths:' glob.",
                    str(entry),
                )

        stripped = strip_code_fences(text)
        if re.search(r"^\s*//", stripped, re.MULTILINE):
            report.add(
                "14-rule-code-comments",
                "WARN",
                f"Rule '{entry.name}' contains // comment outside fenced code block.",
                str(entry),
            )

        words = re.findall(r"[a-zàâçéèêëîïôûùüÿñæœ']+", stripped.lower())
        hits = sum(1 for w in words if w in FRENCH_HEURISTIC_WORDS)
        if hits >= FRENCH_HEURISTIC_THRESHOLD:
            report.add(
                "14-rule-english-only",
                "WARN",
                f"Rule '{entry.name}' appears to contain French content ({hits} heuristic hits).",
                str(entry),
            )


def check_skill_index(root: Path, report: Report, skills: dict[str, dict]) -> None:
    """The CLAUDE.md index names only the skills the harness listing withholds.

    The per-turn listing already carries every visible skill's name and
    description, so re-listing all of them in CLAUDE.md pays twice. What the
    listing cannot convey is what it is hiding: a `disable-model-invocation`
    skill is absent entirely, and a `skillOverrides` entry may strip the
    description. Those are exactly the entries this section must carry, and
    exactly what this check reconciles.
    """
    claude_md = root / "CLAUDE.md"
    if not claude_md.exists() or not skills:
        return
    text = claude_md.read_text(encoding="utf-8")
    section = re.search(r"##\s+Skills index.*?(?=^##\s|\Z)", text, re.DOTALL | re.MULTILINE)
    if not section:
        report.add(
            "15-skill-index",
            "ERROR",
            "CLAUDE.md has no '## Skills index' section to validate against.",
            str(claude_md),
        )
        return
    body = "\n".join(l for l in section.group(0).splitlines() if not l.lstrip().startswith("➜"))
    indexed = {m.group(1) for m in re.finditer(r"`([a-z0-9][a-z0-9-]+)`", body)}
    hidden = listing_hidden_skills(root, skills)

    for name in sorted(hidden):
        if name not in indexed:
            report.add(
                "15-skill-index",
                "ERROR",
                f"Skill '{name}' is withheld from the harness listing but is not named in the CLAUDE.md 'Skills index'. "
                "A withheld skill that nothing points at is unreachable.",
                str(claude_md),
            )
    for ref in sorted(indexed):
        if ref in skills and ref not in hidden:
            report.add(
                "15-skill-index",
                "WARN",
                f"CLAUDE.md 'Skills index' names '{ref}', but that skill is fully listed by the harness. "
                "Drop the entry: the index carries withheld skills only.",
                str(claude_md),
            )


def is_vendored_skill(skill_dir: Path) -> bool:
    """A skill shipping its own LICENSE is upstream code vendored verbatim.

    Project size and split budgets do not apply to files we must be able to
    re-sync from upstream; a table of contents is still required so the file
    stays navigable.
    """
    return (skill_dir / "LICENSE.txt").is_file() or (skill_dir / "LICENSE").is_file()


def check_reference_sizes(root: Path, report: Report) -> None:
    skills_dir = root / ".claude" / "skills"
    if not skills_dir.is_dir():
        return
    for ref in skills_dir.glob("*/references/**/*.md"):
        skill_dir = skills_dir / ref.relative_to(skills_dir).parts[0]
        try:
            text = ref.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        lines = text.count("\n") + 1
        if lines <= REFERENCE_TOC_LINES:
            continue
        head = "\n".join(text.splitlines()[:REFERENCE_TOC_SCAN_LINES]).lower()
        has_toc = "contents:" in head or "## contents" in head or "# contents" in head
        rel_name = ref.relative_to(skills_dir).as_posix()
        if not has_toc:
            report.add(
                "16-reference-size",
                "WARN",
                f"Reference '{rel_name}' is {lines} lines (> {REFERENCE_TOC_LINES}) with no table of contents. Add a 'Contents:' block near the top.",
                str(ref),
            )
        elif lines > REFERENCE_WARN_LINES and not is_vendored_skill(skill_dir):
            report.add(
                "16-reference-size",
                "WARN",
                f"Reference '{rel_name}' is {lines} lines (> {REFERENCE_WARN_LINES}) even with a table of contents. Split it.",
                str(ref),
            )


def check_frontmatter_quoting(root: Path, report: Report) -> None:
    """Flag plain (unquoted) frontmatter scalars containing ': '.

    Claude Code's frontmatter reader is tolerant, but a plain scalar holding
    a colon-space sequence — which every 'Don't use for: ...' anti-trigger
    produces — is invalid under strict YAML and is rejected by js-yaml and
    PyYAML. Quote the value so any downstream consumer can parse the file.
    """
    targets: list[Path] = []
    skills_dir = root / ".claude" / "skills"
    agents_dir = root / ".claude" / "agents"
    if skills_dir.is_dir():
        targets.extend(sorted(skills_dir.glob("*/SKILL.md")))
    if agents_dir.is_dir():
        targets.extend(sorted(agents_dir.glob("*.md")))

    for path in targets:
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        if not text.startswith("---"):
            continue
        lines = text.splitlines()
        end = next((i for i in range(1, len(lines)) if lines[i].strip() == "---"), None)
        if end is None:
            continue
        for raw in lines[1:end]:
            m = re.match(r"^([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*(\S.*)$", raw)
            if not m:
                continue
            key, scalar = m.group(1), m.group(2).strip()
            if scalar[0] in "\"'>|[{":
                continue
            if ": " in scalar:
                report.add(
                    "19-frontmatter-quoting",
                    "WARN",
                    f"'{key}' in {path.parent.name if path.name == 'SKILL.md' else path.stem} is an unquoted scalar containing ': ' — invalid under strict YAML. Wrap the value in double quotes.",
                    str(path),
                )


def check_all_relative_links(root: Path, report: Report) -> None:
    """Every relative markdown link under .claude/ resolves to a real file.

    Check 07 only inspects SKILL.md and only follows links that stay inside the
    skill folder, so a reference linking to a sibling skill — or any link at
    all from a reference file — went unverified. Moving a section one directory
    deeper is exactly how those break, silently.
    """
    base = root / ".claude"
    if not base.is_dir():
        return
    for md in sorted(base.rglob("*.md")):
        try:
            text = md.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for link, _ in iter_relative_links(text):
            if not (md.parent / link).exists():
                report.add(
                    "20-relative-links",
                    "ERROR",
                    f"'{md.relative_to(base)}' links to non-existent '{link}'",
                    str(md),
                )


def check_rule_globs(root: Path, report: Report) -> None:
    """Every `paths:` glob in a rule expands to at least one real file.

    A glob that matches nothing never loads its rule: the guardrail is silently
    inert, and nothing about the file itself looks wrong. An unescaped `[` is
    the documented way to produce one by accident — it opens a character class
    instead of matching a literal bracket.
    """
    rules_dir = root / ".claude" / "rules"
    if not rules_dir.is_dir():
        return
    files = repo_files(root)
    for entry in sorted(rules_dir.glob("*.md")):
        try:
            fm, _ = parse_frontmatter(entry.read_text(encoding="utf-8"))
        except UnicodeDecodeError:
            continue
        if not fm:
            continue
        for pattern in frontmatter_list(fm.get("paths", "")):
            if glob_match_count(pattern, files):
                continue
            bracket = (
                " The unescaped '[' opens a character class — escape it if a literal bracket was meant."
                if "[" in pattern
                else ""
            )
            report.add(
                "22-rule-glob-match",
                "WARN",
                f"Rule '{entry.name}' glob '{pattern}' matches no file in the repository, "
                f"so the rule never loads for it.{bracket}",
                str(entry),
            )


def is_known_tool(entry: str) -> bool:
    """Accept a bare tool, a parameterised `Tool(...)` form, `mcp__*`, or `*`."""
    name = entry.strip()
    if not name:
        return False
    if name == "*" or name.startswith("mcp__"):
        return True
    return name.split("(", 1)[0].strip() in KNOWN_TOOLS


def check_agent_frontmatter_validity(root: Path, report: Report, skills: dict[str, dict]) -> None:
    """Agent frontmatter names things that exist: tools, preloadable skills, a model tier."""
    agents_dir = root / ".claude" / "agents"
    if not agents_dir.is_dir():
        return
    inventory: dict[str, int] = {}
    unvalidated: dict[str, int] = {}
    for entry in sorted(agents_dir.glob("*.md")):
        try:
            text = entry.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        fm, _ = parse_frontmatter(text)
        if not fm:
            continue

        for tool in frontmatter_list(fm.get("tools", "")):
            if is_known_tool(tool):
                continue
            report.add(
                "23-agent-tools",
                "ERROR",
                f"Agent '{entry.stem}' grants unknown tool '{tool}'. The fan-out tool is 'Agent'; "
                "there is no 'Task'. Parameterised forms like 'Agent(review)' or 'Bash(git diff:*)' "
                "and 'mcp__*' names are accepted.",
                str(entry),
            )

        for preload in frontmatter_list(fm.get("skills", "")):
            if not (root / ".claude" / "skills" / preload / "SKILL.md").is_file():
                report.add(
                    "23-agent-skills-preload",
                    "ERROR",
                    f"Agent '{entry.stem}' preloads skill '{preload}', but "
                    f".claude/skills/{preload}/SKILL.md does not exist.",
                    str(entry),
                )
                continue
            flag = str(skills.get(preload, {}).get("disable-model-invocation", "")).strip().lower()
            if flag == "true":
                report.add(
                    "23-agent-skills-preload",
                    "WARN",
                    f"Agent '{entry.stem}' preloads '{preload}', which carries "
                    "'disable-model-invocation: true' and cannot be preloaded. Read it by path instead: "
                    f".claude/skills/{preload}/SKILL.md.",
                    str(entry),
                )

        model = fm.get("model", "").strip()
        if model and model not in KNOWN_MODEL_TIERS and not model.startswith("claude-"):
            report.add(
                "23-agent-model",
                "WARN",
                f"Agent '{entry.stem}' declares model '{model}'. Expected one of "
                f"{', '.join(sorted(KNOWN_MODEL_TIERS))} or a 'claude-*' model id.",
                str(entry),
            )

        for key in frontmatter_keys(text):
            inventory[key] = inventory.get(key, 0) + 1
            if key not in AGENT_VALIDATED_KEYS:
                unvalidated[key] = unvalidated.get(key, 0) + 1

    if inventory:
        seen = ", ".join(f"{k} ({v})" for k, v in sorted(inventory.items()))
        drift = ", ".join(f"{k} ({v})" for k, v in sorted(unvalidated.items())) or "none"
        report.add(
            "23-agent-frontmatter-keys",
            "INFO",
            f"Agent frontmatter keys in use: {seen}. Keys this script does not validate: {drift}.",
            str(agents_dir),
        )


def check_settings_scope(root: Path, report: Report) -> None:
    """Settings keys that are silently ignored at project scope, and dangling overrides."""
    for name in ("settings.json", "settings.local.json"):
        path = root / ".claude" / name
        if not path.is_file():
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError) as exc:
            report.add("24-settings-parse", "ERROR", f"'{name}' is not valid JSON: {exc}", str(path))
            continue
        if not isinstance(data, dict):
            report.add("24-settings-parse", "ERROR", f"'{name}' does not hold a JSON object.", str(path))
            continue

        report.add(
            "24-settings-keys",
            "INFO",
            f"'{name}' top-level keys: {', '.join(sorted(data)) if data else '(none)'}.",
            str(path),
        )

        permissions = data.get("permissions")
        mode = str(permissions.get("defaultMode", "")).strip() if isinstance(permissions, dict) else ""
        if mode in PROJECT_SCOPE_IGNORED_MODES:
            report.add(
                "24-settings-default-mode",
                "WARN",
                f"'permissions.defaultMode: {mode}' in '{name}' is ignored at project scope since "
                "Claude Code 2.1.257 — set it in user or managed settings, or pass --permission-mode.",
                str(path),
            )

        overrides = data.get("skillOverrides")
        if isinstance(overrides, dict):
            for skill_name in sorted(overrides):
                if not (root / ".claude" / "skills" / skill_name / "SKILL.md").is_file():
                    report.add(
                        "24-settings-skill-overrides",
                        "ERROR",
                        f"skillOverrides in '{name}' names '{skill_name}', which is not a skill folder "
                        "under .claude/skills/.",
                        str(path),
                    )


def check_orphan_references(root: Path, report: Report) -> None:
    """Every reference must be reachable from its own SKILL.md.

    A reference linked only from a sibling reference sits two hops from the
    body, and the second hop is the one Claude skips: it gets read partially,
    or not at all. Vendored skills are not exempt — reachability is not a size
    budget. Non-markdown assets are, since they are consumed as data. A file in
    a references/ subdirectory (archives, retired routes) may instead be routed
    from a top-level reference that SKILL.md links — the router pattern.
    """
    skills_dir = root / ".claude" / "skills"
    if not skills_dir.is_dir():
        return
    for skill_dir in sorted(skills_dir.iterdir()):
        skill_md = skill_dir / "SKILL.md"
        refs_dir = skill_dir / "references"
        if not skill_dir.is_dir() or not skill_md.is_file() or not refs_dir.is_dir():
            continue
        try:
            text = skill_md.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        linked = {(skill_md.parent / link).resolve() for link, _ in iter_relative_links(text)}
        routers: list[tuple[str, set[Path]]] = []
        for router in sorted(refs_dir.glob("*.md")):
            router_rel = router.relative_to(skill_dir).as_posix()
            if not (router.resolve() in linked or router_rel in text or router.name in text):
                continue
            try:
                router_text = router.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                continue
            router_links = {(router.parent / link).resolve() for link, _ in iter_relative_links(router_text)}
            routers.append((router_text, router_links))
        for ref in sorted(refs_dir.rglob("*.md")):
            rel = ref.relative_to(skill_dir).as_posix()
            if ref.resolve() in linked or rel in text or ref.name in text:
                continue
            if ref.parent != refs_dir and any(
                ref.resolve() in router_links or ref.name in router_text
                for router_text, router_links in routers
            ):
                continue
            report.add(
                "25-orphan-reference",
                "WARN",
                f"Reference '{skill_dir.name}/{rel}' is neither linked nor named from its SKILL.md — "
                "a reference reachable only from another reference gets read partially or not at all.",
                str(ref),
            )


def looks_like_anti_trigger(case: dict) -> bool:
    label = f"{case.get('id', '')} {case.get('name', '')}".lower()
    if any(token in label for token in EVALS_ANTI_NAME_TOKENS):
        return True
    expectations = case.get("expectations")
    if isinstance(expectations, list):
        for expectation in expectations:
            lowered = str(expectation).lower()
            if any(token in lowered for token in EVALS_ANTI_EXPECTATION_TOKENS):
                return True
    return False


def check_evals(root: Path, report: Report) -> None:
    """Schema and coverage of each skill's eval suite."""
    skills_dir = root / ".claude" / "skills"
    if not skills_dir.is_dir():
        return
    for skill_dir in sorted(skills_dir.iterdir()):
        path = skill_dir / "evals" / "evals.json"
        if not path.is_file():
            continue
        name = skill_dir.name
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError) as exc:
            report.add("26-evals-schema", "ERROR", f"evals.json in '{name}' does not parse: {exc}", str(path))
            continue
        if not isinstance(data, dict) or "skill_name" not in data or "evals" not in data:
            report.add(
                "26-evals-schema",
                "ERROR",
                f"evals.json in '{name}' must be an object carrying 'skill_name' and 'evals'.",
                str(path),
            )
            continue
        if data["skill_name"] != name:
            report.add(
                "26-evals-schema",
                "ERROR",
                f"evals.json in '{name}' declares skill_name '{data['skill_name']}'.",
                str(path),
            )
        cases = data["evals"]
        # [cbragard.llm] projection evals/1
        if isinstance(data, dict) and data.get("schema") == "evals/1":
            # Schema evals/1 (2026-09-20) : les attendus vivent dans `assertions`.
            # Projection en memoire sur les cles historiques, pour que les
            # controles en aval restent inchanges. Le fichier n'est pas modifie.
            cases = [
                c if not isinstance(c, dict) else {
                    **c,
                    "expectations": c.get("expectations")
                    or [a.get("text", "") for a in (c.get("assertions") or []) if isinstance(a, dict)]
                    or [f"selects skill {c.get('expected_skill', '')}"],
                    "expected_output": c.get("expected_output")
                    or ((c.get("assertions") or [{}])[0] or {}).get("text", "")
                    or f"selects skill {c.get('expected_skill', '')}",
                }
                for c in cases
            ]
        if not isinstance(cases, list):
            report.add("26-evals-schema", "ERROR", f"'evals' in '{name}' is not a list.", str(path))
            continue

        ids: list = []
        for position, case in enumerate(cases, start=1):
            if not isinstance(case, dict):
                report.add("26-evals-schema", "ERROR", f"Eval #{position} in '{name}' is not an object.", str(path))
                continue
            missing = [key for key in EVALS_REQUIRED_KEYS if key not in case]
            if missing:
                report.add(
                    "26-evals-schema",
                    "ERROR",
                    f"Eval #{position} in '{name}' is missing: {', '.join(missing)}.",
                    str(path),
                )
            expectations = case.get("expectations")
            if "expectations" in case and (
                not isinstance(expectations, list)
                or not expectations
                or not all(isinstance(item, str) for item in expectations)
            ):
                report.add(
                    "26-evals-schema",
                    "ERROR",
                    f"Eval #{position} in '{name}' has an 'expectations' value that is not a non-empty list of strings.",
                    str(path),
                )
            if "id" in case:
                if isinstance(case["id"], bool) or not isinstance(case["id"], (int, str)):
                    report.add(
                        "26-evals-schema",
                        "ERROR",
                        f"Eval #{position} in '{name}' has an 'id' that is neither an integer nor a slug string.",
                        str(path),
                    )
                else:
                    ids.append(case["id"])

        duplicates = sorted({str(i) for i in ids if ids.count(i) > 1})
        if duplicates:
            report.add(
                "26-evals-schema",
                "ERROR",
                f"Duplicate eval id(s) in '{name}': {', '.join(duplicates)}.",
                str(path),
            )
        id_types = {type(i).__name__ for i in ids}
        if len(id_types) > 1:
            report.add(
                "26-evals-id-type",
                "WARN",
                f"evals.json in '{name}' mixes integer and slug ids. Pick one form per file.",
                str(path),
            )
        elif id_types == {"str"}:
            report.add(
                "26-evals-id-type",
                "INFO",
                f"evals.json in '{name}' uses slug string ids where the documented schema says integer. "
                "Accepted — the file is internally consistent.",
                str(path),
            )

        if len(cases) < EVALS_MIN_COUNT:
            report.add(
                "26-evals-count",
                "WARN",
                f"'{name}' has {len(cases)} eval(s) (official minimum {EVALS_MIN_COUNT}).",
                str(path),
            )
        if cases and not any(looks_like_anti_trigger(c) for c in cases if isinstance(c, dict)):
            report.add(
                "26-evals-anti-trigger",
                "WARN",
                f"'{name}' has no anti-trigger eval. Heuristic: an id or name containing "
                f"{', '.join(EVALS_ANTI_NAME_TOKENS)}, or an expectation containing "
                f"{', '.join(EVALS_ANTI_EXPECTATION_TOKENS)}. A suite that only tests triggering "
                "never tests the boundary.",
                str(path),
            )


DIVISION_OWNER_NOISE_RE = re.compile(r"`|\*\*|\(this skill\)|\(the (?:method|facts)\)|➜ See skill:")
DIVISION_SEPARATOR_RE = re.compile(r"^\|[\s\-:|]+\|$")


def division_table_rows(body: str) -> list[tuple[str, str]] | None:
    """Return (concern, owner) rows of the first Division of responsibilities table.

    None when the heading is absent. Concern and owner are normalised: whitespace
    collapsed, backticks, bold markers, `(this skill)` and `➜ See skill:` removed.
    The owner is the first token of the second cell, so `rom-ssr (this skill)` and
    `**rom-ssr**` both resolve to `rom-ssr`.
    """
    heading = DIVISION_HEADING_RE.search(body)
    if not heading:
        return None
    section = body[heading.end():]
    next_heading = re.search(r"^#{1,6}\s+", section, re.MULTILINE)
    if next_heading:
        section = section[: next_heading.start()]
    rows: list[tuple[str, str]] = []
    for line in section.splitlines():
        line = line.strip()
        if not line.startswith("|") or DIVISION_SEPARATOR_RE.match(line):
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) < 2 or cells[0].lower() in {"concern", ""}:
            continue
        concern = " ".join(DIVISION_OWNER_NOISE_RE.sub("", cells[0]).split())
        owner_cell = DIVISION_OWNER_NOISE_RE.sub("", cells[1]).strip()
        owner = owner_cell.split()[0] if owner_cell else ""
        rows.append((concern, owner))
    return rows


def check_twin_division_tables(root: Path, report: Report, skills: dict[str, dict]) -> None:
    """Mutually anti-triggering skills must both carry a division table that names the twin.

    Twin pairs are detected mechanically: A's description points at B with
    `→ B` and B's points back at A. Pointers naming an agent rather than a
    skill are ignored. Three things are asserted, each a WARN: the heading is
    present on both sides; each table has a row owned by the twin; and the
    concern text of the row naming the pair reads identically on both sides.
    The tables are family-wide, so their other rows may differ. A vendored
    skill cannot carry the heading in its upstream SKILL.md, so its
    references/ overlay counts too.
    """
    bodies: dict[str, str] = {}
    pointers: dict[str, set[str]] = {}
    for name, meta in skills.items():
        try:
            bodies[name] = Path(meta["path"]).read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue
        skill_dir = Path(meta["path"]).parent
        if is_vendored_skill(skill_dir):
            for overlay in sorted((skill_dir / "references").glob("*.md")):
                try:
                    bodies[name] += "\n" + overlay.read_text(encoding="utf-8")
                except (OSError, UnicodeDecodeError):
                    continue
        targets = {m.group(1) for m in POINTER_RE.finditer(meta.get("description", ""))}
        pointers[name] = targets & set(skills)

    pairs = sorted(
        {
            tuple(sorted((name, target)))
            for name, targets in pointers.items()
            for target in targets
            if target != name and name in pointers.get(target, set())
        }
    )
    tables = {name: division_table_rows(body) for name, body in bodies.items()}
    for first, second in pairs:
        for name, twin in ((first, second), (second, first)):
            if name not in bodies:
                continue
            rows = tables.get(name)
            if rows is None:
                report.add(
                    "27-twin-division-table",
                    "WARN",
                    f"Twin pair '{first}' <-> '{second}': '{name}' has no "
                    f"'Division of responsibilities' heading, so only '{twin}' documents the split.",
                    skills[name]["path"],
                )
                continue
            if not any(owner == twin for _, owner in rows):
                report.add(
                    "27-twin-division-row",
                    "WARN",
                    f"Twin pair '{first}' <-> '{second}': the table in '{name}' has no row owned by "
                    f"'{twin}', so a reader of '{name}' never learns what '{twin}' takes.",
                    skills[name]["path"],
                )
        first_rows, second_rows = tables.get(first), tables.get(second)
        if first_rows is None or second_rows is None:
            continue
        first_about_second = {c for c, o in first_rows if o == second}
        second_about_itself = {c for c, o in second_rows if o == second}
        second_about_first = {c for c, o in second_rows if o == first}
        first_about_itself = {c for c, o in first_rows if o == first}
        for reader, subject, seen, claimed in (
            (first, second, first_about_second, second_about_itself),
            (second, first, second_about_first, first_about_itself),
        ):
            if seen and claimed and not (seen & claimed):
                report.add(
                    "27-twin-division-text",
                    "WARN",
                    f"Twin pair '{first}' <-> '{second}': '{reader}' says '{subject}' owns "
                    f"'{sorted(seen)[0][:80]}' but '{subject}' words its own row as "
                    f"'{sorted(claimed)[0][:80]}'. The row naming the pair must read identically on both sides.",
                    skills[reader]["path"],
                )


def print_text_report(report: Report) -> None:
    by_sev: dict[str, list[Finding]] = {"ERROR": [], "WARN": [], "INFO": [], "OK": []}
    for f in report.findings:
        by_sev.setdefault(f.severity, []).append(f)
    for sev in ("ERROR", "WARN", "INFO"):
        items = by_sev.get(sev, [])
        if not items:
            continue
        print(f"\n=== {sev} ({len(items)}) ===")
        for f in items:
            loc = f" [{f.location}]" if f.location else ""
            print(f"  [{f.check}] {f.message}{loc}")
    counts = report.counts()
    print(
        f"\nExecuted {len(CHECKS)} check groups. "
        f"Summary: {counts['ERROR']} error(s), {counts['WARN']} warning(s)."
    )
    if not report.has_errors() and counts["WARN"] == 0:
        print("All checks passed.")


# [cbragard.llm] ancrage
ANCHOR_SEVERITY = "WARN"   # cliquet : passer a "ERROR" une fois ce depot a zero
ANCHOR_PATH_RE = re.compile(
    r"\b(?:src|server|scripts|electron|docker|app|lib|packages|test|tests)"
    r"/[A-Za-z0-9_./-]+\.[a-z]{2,4}\b"
)
ANCHOR_TEMPLATE_RE = re.compile(
    r"(MyPage|Feature|Example|Foo|Bar|YourThing|<[^>]+>|placeholder|xxx)", re.IGNORECASE
)


def check_skill_anchors(root: Path, report: Report) -> None:
    """Every path a SKILL.md names in its body must resolve to a real file.

    A skill cannot fail loudly: when the code it describes moves, the skill keeps
    loading and keeps saying the same thing. Naming a verifiable path is the only
    way a doctrine can be contradicted by reality. A dead anchor is worse than no
    anchor: the skill is read in full at level 2, then the model looks for a file
    that is gone and falls back to exploration (Glob/Grep) - a fixed cost turned
    into an open one.
    """
    skills_dir = root / ".claude" / "skills"
    if not skills_dir.is_dir():
        return
    total = anchored = alive = dead = 0
    for skill_md in sorted(skills_dir.glob("*/SKILL.md")):
        total += 1
        name = skill_md.parent.name
        try:
            text = skill_md.read_text(encoding="utf-8")
        except OSError:
            continue
        body = re.sub(r"^---\n.*?\n---\n", "", text, flags=re.S)
        refs = sorted(set(ANCHOR_PATH_RE.findall(body)))
        if not refs:
            continue
        anchored += 1
        for ref in refs:
            if (root / ref).exists():
                alive += 1
            elif (skill_md.parent / ref).exists():
                alive += 1          # ${CLAUDE_SKILL_DIR}/... written relative in the body
            elif ANCHOR_TEMPLATE_RE.search(ref):
                continue            # template / illustrative path
            else:
                dead += 1
                report.add(
                    "28-skill-anchors",
                    ANCHOR_SEVERITY,
                    f"'{name}' names '{ref}', which does not exist. A dead anchor sends the "
                    "model exploring for a file that is gone: fix the path, or drop the claim.",
                    str(skill_md),
                )
    if total:
        report.add(
            "28-skill-anchors",
            "INFO",
            f"Falsifiability: {anchored}/{total} skills name at least one checkable path "
            f"({100 * anchored / total:.0f}%). Live anchors {alive}, dead {dead}. "
            "A skill that names nothing verifiable cannot be proven wrong - it can only rot quietly.",
            str(skills_dir),
        )


# [cbragard.llm] plafond derive
def check_listing_budget_derived(root: Path, report: Report, skills: dict) -> None:
    """The listing ceiling this repository actually has, derived from its settings.

    The harness gives the skill listing a fraction of the context window (1% by
    default), scaled by `skillListingBudgetFraction`. On overflow the listing keeps
    every skill NAME and drops DESCRIPTIONS, least-invoked first - silently. So the
    real ceiling is a per-repository number even though the rule is the same
    everywhere. That is why this check derives it instead of hard-coding it: the
    fraction is a dial the repository owns.
    """
    fraction = LISTING_FRACTION_DEFAULT
    source = "harness default"
    settings = root / ".claude" / "settings.json"
    if settings.is_file():
        try:
            value = json.loads(settings.read_text(encoding="utf-8")).get("skillListingBudgetFraction")
            if isinstance(value, (int, float)) and value > 0:
                fraction, source = float(value), "skillListingBudgetFraction"
        except (json.JSONDecodeError, UnicodeDecodeError, OSError):
            pass
    ceiling = int(fraction * CONTEXT_WINDOW_TOKENS * CHARS_PER_TOKEN)
    listed = sum(len(meta.get("description", "")) for meta in skills.values()
                 if isinstance(meta, dict) and meta.get("listed", True))
    pct = 100 * listed / ceiling if ceiling else 0
    severity = "ERROR" if listed > ceiling else ("WARN" if pct > 80 else "INFO")
    report.add(
        "29-listing-budget-derived",
        severity,
        f"Listed skill descriptions: {listed} chars against a derived ceiling of {ceiling} "
        f"({fraction} x {CONTEXT_WINDOW_TOKENS} tokens x {CHARS_PER_TOKEN} chars/token, from "
        f"{source}) - {pct:.0f}% used. Past the ceiling the listing silently keeps names and "
        f"drops descriptions, least-invoked first. The chars/token ratio is rough: treat this "
        f"as an order of magnitude, and {ALWAYS_LOADED_WARN_CHARS} as the house ratchet.",
        str(root / ".claude" / "settings.json"),
    )


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Audit Claude configuration.")
    parser.add_argument("--root", default=".", help="Repository root (default: cwd)")
    parser.add_argument("--json", action="store_true", help="Output JSON instead of text")
    args = parser.parse_args(argv)

    root = Path(args.root).resolve()
    report = Report()

    check_claude_md(root, report)
    skills = check_skills(root, report)
    agents = check_agents(root, report)
    check_agent_descriptions(report, agents)
    check_cross_refs(root, report, skills, agents)
    check_english_only(root, report)
    check_no_code_comments_in_skills(root, report)
    check_no_global_scripts(root, report)
    check_rules(root, report)
    check_skill_index(root, report, skills)
    check_reference_sizes(root, report)
    check_always_loaded_budget(root, report, skills, agents)
    check_see_skill_targets(root, report, skills)
    check_frontmatter_quoting(root, report)
    check_all_relative_links(root, report)
    check_rule_globs(root, report)
    check_agent_frontmatter_validity(root, report, skills)
    check_settings_scope(root, report)
    check_orphan_references(root, report)
    check_evals(root, report)
    check_twin_division_tables(root, report, skills)

    check_skill_anchors(root, report)
    check_listing_budget_derived(root, report, skills)

    if args.json:
        out = {
            "checks_executed": len(CHECKS),
            "counts": report.counts(),
            "findings": [asdict(f) for f in report.findings],
        }
        print(json.dumps(out, indent=2))
    else:
        print_text_report(report)

    return 1 if report.has_errors() else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
