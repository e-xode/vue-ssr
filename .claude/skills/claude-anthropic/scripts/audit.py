#!/usr/bin/env python3
"""Audit the Claude configuration of the Vue SSR Starter Kit project.

Runs 14 mechanical checks against CLAUDE.md, skills (.claude/skills/),
agents (.claude/agents/), rules (.claude/rules/) and reports OK/WARN/ERROR.
Exits 1 on any error.

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
import re
import sys
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Iterable

CLAUDE_MD_MAX_BYTES = 10 * 1024
SKILL_MD_WARN_BYTES = 50 * 1024
DESCRIPTION_MIN_CHARS = 80
DESCRIPTION_MAX_CHARS = 1536
DESCRIPTION_WARN_CHARS = 1024
RULE_MAX_BYTES = 2048
FRENCH_HEURISTIC_WORDS = {
    "avec", "pour", "dans", "cette", "celui", "celle", "ceux", "celles",
    "vous", "nous", "etre", "tres", "donc", "ainsi", "depuis", "toujours",
    "jamais", "ensuite", "alors", "parce", "lorsque", "fichier", "dossier",
    "exemple", "doit", "peut", "faut", "selon",
}
FRENCH_HEURISTIC_THRESHOLD = 3


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
    for raw in lines[1:end]:
        if re.match(r"^[A-Za-z_][A-Za-z0-9_-]*\s*:", raw):
            if current_key is not None:
                data[current_key] = "\n".join(buf).strip().strip('"').strip("'").replace("''", "'")
                buf = []
            key, _, value = raw.partition(":")
            current_key = key.strip()
            buf.append(value.strip())
        else:
            buf.append(raw.strip())
    if current_key is not None:
        data[current_key] = "\n".join(buf).strip().strip('"').strip("'").replace("''", "'")
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


def check_claude_md(root: Path, report: Report) -> None:
    path = root / "CLAUDE.md"
    if not path.exists():
        report.add("01-claude-md-exists", "ERROR", "CLAUDE.md not found", str(path))
        return
    size = path.stat().st_size
    if size > CLAUDE_MD_MAX_BYTES:
        report.add(
            "01-claude-md-size", "ERROR",
            f"CLAUDE.md is {size} bytes (max {CLAUDE_MD_MAX_BYTES}). Move knowledge to skills.",
            str(path),
        )
    else:
        report.add("01-claude-md-size", "OK", f"CLAUDE.md size {size} bytes <= {CLAUDE_MD_MAX_BYTES}.", str(path))

    text = path.read_text(encoding="utf-8")
    stripped = strip_code_fences(text)
    if re.search(r"^\s*//", stripped, re.MULTILINE) or re.search(r"/\*[^!]", stripped):
        report.add(
            "12-no-code-comments", "WARN",
            "CLAUDE.md contains // or /* */ outside fenced code blocks.",
            str(path),
        )
    else:
        report.add("12-no-code-comments", "OK", "CLAUDE.md has no code comments outside fenced blocks.", str(path))


def check_skills(root: Path, report: Report, max_desc: int = DESCRIPTION_WARN_CHARS) -> dict[str, dict]:
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
            report.add("02-skill-md-exists", "ERROR", f"Skill folder '{entry.name}' has no SKILL.md", str(entry))
            continue
        text = skill_md.read_text(encoding="utf-8")
        fm, _ = parse_frontmatter(text)
        if not fm:
            report.add("02-skill-frontmatter", "ERROR", f"SKILL.md in '{entry.name}' has no valid YAML frontmatter", str(skill_md))
            continue
        name = fm.get("name", "").strip()
        desc = fm.get("description", "").strip()
        if not name:
            report.add("02-skill-frontmatter", "ERROR", "Missing 'name' in frontmatter", str(skill_md))
        if not desc:
            report.add("02-skill-frontmatter", "ERROR", "Missing 'description' in frontmatter", str(skill_md))

        if name and name == entry.name:
            report.add("03-skill-name-matches-folder", "OK", f"Skill '{entry.name}' name matches folder.", str(skill_md))
        elif name:
            report.add("03-skill-name-matches-folder", "ERROR", f"Frontmatter name '{name}' does not match folder '{entry.name}'", str(skill_md))

        if desc:
            if len(desc) < DESCRIPTION_MIN_CHARS:
                report.add("04-skill-description-length", "WARN", f"Skill '{entry.name}' description is only {len(desc)} chars (min {DESCRIPTION_MIN_CHARS})", str(skill_md))
            elif len(desc) > DESCRIPTION_MAX_CHARS:
                report.add("04-skill-description-length", "ERROR", f"Skill '{entry.name}' description is {len(desc)} chars (> hard max {DESCRIPTION_MAX_CHARS})", str(skill_md))
            elif len(desc) > max_desc:
                report.add("04-skill-description-length", "WARN", f"Skill '{entry.name}' description is {len(desc)} chars (> recommended max {max_desc})", str(skill_md))
            else:
                report.add("04-skill-description-length", "OK", f"Skill '{entry.name}' description is {len(desc)} chars.", str(skill_md))
            if not re.search(r"Don'?t use|Anti-?trigger", desc, re.IGNORECASE):
                report.add("04-skill-description-antitrigger", "WARN", f"Skill '{entry.name}' description has no anti-trigger clause", str(skill_md))

        size = skill_md.stat().st_size
        if size > SKILL_MD_WARN_BYTES:
            report.add("05-skill-md-size", "WARN", f"SKILL.md in '{entry.name}' is {size} bytes (> {SKILL_MD_WARN_BYTES}). Consider splitting.", str(skill_md))

        if name and name in seen_names:
            report.add("06-skill-duplicate-name", "ERROR", f"Duplicate skill name '{name}' (also in '{seen_names[name]}')", str(skill_md))
        elif name:
            seen_names[name] = entry.name

        for link, _ in iter_relative_links(text):
            target = (skill_md.parent / link).resolve()
            try:
                target.relative_to(skill_md.parent.resolve())
            except ValueError:
                continue
            if not target.exists():
                report.add("07-skill-broken-link", "ERROR", f"SKILL.md in '{entry.name}' links to non-existent '{link}'", str(skill_md))

        skills[entry.name] = {"name": name, "description": desc, "path": str(skill_md)}
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
            report.add("08-agent-frontmatter", "ERROR", f"Agent '{entry.stem}' has no valid YAML frontmatter", str(entry))
            continue
        missing = [k for k in ("name", "description", "tools") if not fm.get(k)]
        if missing:
            report.add("08-agent-frontmatter", "ERROR", f"Agent '{entry.stem}' missing required keys: {', '.join(missing)}", str(entry))
        else:
            report.add("08-agent-frontmatter", "OK", f"Agent '{entry.stem}' has valid frontmatter.", str(entry))
        agents[entry.stem] = {"name": fm.get("name", ""), "path": str(entry)}
    return agents


def check_cross_refs(root: Path, report: Report, skills: dict[str, dict], agents: dict[str, dict]) -> None:
    claude_md = root / "CLAUDE.md"
    if not claude_md.exists():
        return
    text = claude_md.read_text(encoding="utf-8")

    referenced_agents: set[str] = set()
    agents_table_match = re.search(r"##\s+Agents directory.*?(?=^##\s|\Z)", text, re.DOTALL | re.MULTILINE)
    if agents_table_match:
        block = agents_table_match.group(0)
        for m in re.finditer(r"\|\s*`([a-z0-9-]+)`\s*\|", block):
            referenced_agents.add(m.group(1))

    agent_errors = False
    for agent_name in agents:
        if agent_name not in referenced_agents:
            report.add("09-agent-in-claude-md", "ERROR", f"Agent '{agent_name}' exists but not in CLAUDE.md 'Agents directory'", str(claude_md))
            agent_errors = True
    for ref in referenced_agents:
        if ref not in agents:
            report.add("09-claude-md-agent-missing", "ERROR", f"CLAUDE.md references agent '{ref}' but .claude/agents/{ref}.md missing", str(claude_md))
            agent_errors = True
    if not agent_errors and agents:
        report.add("09-agent-cross-refs", "OK", f"All {len(agents)} agents cross-referenced correctly.", str(claude_md))

    referenced_skills: set[str] = set()
    skills_index_match = re.search(r"##\s+Skills index.*?\Z", text, re.DOTALL | re.MULTILINE)
    if skills_index_match:
        block = skills_index_match.group(0)
        for m in re.finditer(r"\|\s*`([a-z0-9-]+)`\s*\|", block):
            referenced_skills.add(m.group(1))

    skill_errors = False
    for skill_name in skills:
        if skill_name not in referenced_skills:
            report.add("10-skill-in-claude-md-index", "WARN", f"Skill '{skill_name}' exists but not in CLAUDE.md 'Skills index'", str(claude_md))
            skill_errors = True
    for ref in referenced_skills:
        if ref not in skills:
            report.add("10-claude-md-skill-missing", "WARN", f"CLAUDE.md skills index references '{ref}' but .claude/skills/{ref}/ missing", str(claude_md))
            skill_errors = True
    if not skill_errors and skills:
        report.add("10-skill-cross-refs", "OK", f"All {len(skills)} skills cross-referenced correctly.", str(claude_md))


def check_english_only(root: Path, report: Report) -> None:
    skills_dir = root / ".claude" / "skills"
    if not skills_dir.is_dir():
        return
    for skill in skills_dir.iterdir():
        if not skill.is_dir():
            continue
        for p in skill.rglob("*.md"):
            try:
                text = p.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                continue
            stripped = strip_code_fences(text).lower()
            words = re.findall(r"[a-zàâçéèêëîïôûùüÿñæœ']+", stripped)
            hits = sum(1 for w in words if w in FRENCH_HEURISTIC_WORDS)
            if hits >= FRENCH_HEURISTIC_THRESHOLD:
                report.add("11-english-only", "WARN", f"File may contain French ({hits} hits).", str(p))


def check_no_code_comments_in_skills(root: Path, report: Report) -> None:
    skills_dir = root / ".claude" / "skills"
    if not skills_dir.is_dir():
        return
    for skill_md in skills_dir.glob("*/SKILL.md"):
        text = skill_md.read_text(encoding="utf-8")
        stripped = strip_code_fences(text)
        if re.search(r"^\s*//", stripped, re.MULTILINE):
            report.add("12-no-code-comments", "WARN", "SKILL.md contains // outside fenced code block", str(skill_md))


def check_no_global_scripts(root: Path, report: Report) -> None:
    global_scripts = root / ".claude" / "scripts"
    if not global_scripts.exists():
        return
    files = [p for p in global_scripts.rglob("*") if p.is_file()]
    if not files:
        return
    for path in files:
        report.add("13-no-global-scripts", "ERROR", f"Script '{path.name}' in .claude/scripts/ (move to owning skill)", str(path))


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
            report.add("14-rule-size", "WARN", f"Rule '{entry.name}' is {size} bytes (> {RULE_MAX_BYTES})", str(entry))

        fm, _ = parse_frontmatter(text)
        if fm is not None:
            paths_val = fm.get("paths", "").strip()
            if not paths_val:
                report.add("14-rule-no-paths", "WARN", f"Rule '{entry.name}' has no 'paths:' glob (loads every turn)", str(entry))

        stripped = strip_code_fences(text)
        if re.search(r"^\s*//", stripped, re.MULTILINE):
            report.add("14-rule-code-comments", "WARN", f"Rule '{entry.name}' contains // outside fenced code block", str(entry))

        words = re.findall(r"[a-zàâçéèêëîïôûùüÿñæœ']+", stripped.lower())
        hits = sum(1 for w in words if w in FRENCH_HEURISTIC_WORDS)
        if hits >= FRENCH_HEURISTIC_THRESHOLD:
            report.add("14-rule-english-only", "WARN", f"Rule '{entry.name}' may contain French ({hits} hits)", str(entry))


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
    print(f"\nSummary: {counts['ERROR']} error(s), {counts['WARN']} warning(s), {counts['OK']} ok-check(s).")


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Audit Claude configuration.")
    parser.add_argument("--root", default=".", help="Repository root (default: cwd)")
    parser.add_argument("--json", action="store_true", help="Output JSON instead of text")
    parser.add_argument("--max-desc", type=int, default=DESCRIPTION_WARN_CHARS,
                        help=f"Max recommended description length (default: {DESCRIPTION_WARN_CHARS})")
    args = parser.parse_args(argv)

    root = Path(args.root).resolve()
    report = Report()

    check_claude_md(root, report)
    skills = check_skills(root, report, max_desc=args.max_desc)
    agents = check_agents(root, report)
    check_cross_refs(root, report, skills, agents)
    check_english_only(root, report)
    check_no_code_comments_in_skills(root, report)
    check_no_global_scripts(root, report)
    check_rules(root, report)

    if args.json:
        out = {"counts": report.counts(), "findings": [asdict(f) for f in report.findings]}
        print(json.dumps(out, indent=2))
    else:
        print_text_report(report)

    return 1 if report.has_errors() else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
