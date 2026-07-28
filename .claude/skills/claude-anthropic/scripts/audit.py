#!/usr/bin/env python3
"""Audit the Claude configuration of the Vue SSR Starter Kit (e-xode/vue-ssr).

Runs the mechanical checks listed in CHECKS against CLAUDE.md, skills
(.claude/skills/), agents (.claude/agents/), rules (.claude/rules/) and reports
OK/WARN/ERROR. Most checks emit a finding only on failure; a clean run prints
the executed-count summary so success stays legible. Exits 1 on any error.

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
REFERENCE_WARN_LINES = 300
DESCRIPTION_MIN_CHARS = 80
DESCRIPTION_MAX_CHARS = 1536
AGENT_DESCRIPTION_MAX_CHARS = 900
ALWAYS_LOADED_WARN_CHARS = 43000
ALWAYS_LOADED_ERROR_CHARS = 47000
SKILL_DESC_AGGREGATE_WARN_CHARS = 23000

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
    "reference file size",
    "always-loaded context budget",
    "see-skill cross-reference targets",
)
FRENCH_HEURISTIC_WORDS = {
    "avec", "pour", "dans", "cette", "celui", "celle", "ceux", "celles",
    "vous", "nous", "etre", "tres", "donc", "ainsi",
    "depuis", "toujours", "jamais", "ensuite", "alors", "parce", "lorsque",
    "fichier", "dossier", "exemple", "doit", "peut", "faut", "selon",
}
FRENCH_HEURISTIC_THRESHOLD = 3

SEVERITY_ORDER = {"OK": 0, "INFO": 1, "WARN": 2, "ERROR": 3}


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
                    f"Skill '{entry.name}' description is {len(desc)} chars (> {DESCRIPTION_MAX_CHARS}). May be truncated in skill listing.",
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
        if size > SKILL_MD_WARN_BYTES:
            report.add(
                "05-skill-md-size",
                "WARN",
                f"SKILL.md in '{entry.name}' is {size} bytes (> {SKILL_MD_WARN_BYTES}). Consider splitting.",
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


def check_always_loaded_budget(
    root: Path, report: Report, skills: dict[str, dict], agents: dict[str, dict]
) -> None:
    claude_md = root / "CLAUDE.md"
    claude_md_bytes = claude_md.stat().st_size if claude_md.exists() else 0
    skill_chars = sum(len(s.get("description", "")) for s in skills.values())
    agent_chars = sum(len(a.get("description", "")) for a in agents.values())
    total = claude_md_bytes + skill_chars + agent_chars
    message = (
        f"Always-loaded context: {total} chars "
        f"(CLAUDE.md {claude_md_bytes} B + skill descriptions {skill_chars} + agent descriptions {agent_chars})."
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
            "the harness truncated the skills listing between ~23.1k and ~23.5k chars (bounded 2026-07-19, cap undocumented) "
            "and every skill past the cutoff loses its trigger surface. Trim descriptions.",
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
                targets.append(p)
    src_dir = root / "src"
    if src_dir.is_dir():
        translate_dir = src_dir / "translate"
        for pattern in ("*.md", "*.txt"):
            for p in src_dir.rglob(pattern):
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
    claude_md = root / "CLAUDE.md"
    if not claude_md.exists() or not skills:
        return
    text = claude_md.read_text(encoding="utf-8")
    section = re.search(
        r"##\s+Skills index.*?(?=^##\s|\Z)", text, re.DOTALL | re.MULTILINE
    )
    if not section:
        report.add(
            "15-skill-index",
            "ERROR",
            "CLAUDE.md has no '## Skills index' section to validate against.",
            str(claude_md),
        )
        return
    block = section.group(0)
    indexed = {m.group(1) for m in re.finditer(r"`([a-z0-9][a-z0-9-]+)`", block)}
    for name in skills:
        if name not in indexed:
            report.add(
                "15-skill-index",
                "ERROR",
                f"Skill '{name}' exists under .claude/skills/ but is not listed in the CLAUDE.md 'Skills index'.",
                str(claude_md),
            )
    for ref in indexed:
        if ref not in skills:
            report.add(
                "15-skill-index",
                "WARN",
                f"CLAUDE.md 'Skills index' lists '{ref}' but no matching skill folder exists.",
                str(claude_md),
            )


def check_reference_sizes(root: Path, report: Report) -> None:
    skills_dir = root / ".claude" / "skills"
    if not skills_dir.is_dir():
        return
    for ref in skills_dir.glob("*/references/*.md"):
        try:
            lines = ref.read_text(encoding="utf-8").count("\n") + 1
        except UnicodeDecodeError:
            continue
        if lines > REFERENCE_WARN_LINES:
            report.add(
                "16-reference-size",
                "WARN",
                f"Reference '{ref.parent.parent.name}/{ref.name}' is {lines} lines (> {REFERENCE_WARN_LINES}). Split it or ship a table of contents.",
                str(ref),
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
