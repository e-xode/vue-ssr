#!/usr/bin/env python3
"""Status line launcher, written by `deadweight --setup-statusline`. Carries no display logic.

It runs the status line template of the deadweight plugin INSTALLED for this project.
Until 0.13.1 the setup copied the template itself into the project, and a copy stays at
the version it was taken from: 0.13.0 added notices to the line, and every copy made
before it went on without them until the setup was run again. This file only finds the
template, so a plugin update reaches the line at the next session.

Two hosts, two places. Claude Code runs it as `<project>/.claude/statusline.py` and
keeps its installs in `installed_plugins.json`. Copilot CLI runs it from
`~/.copilot/deadweight-statusline.py` with the argument `copilot`, and keeps its
installs as folders under `installed-plugins/`. The host's own install is looked up
first, the other one second: both read the same cached audit, so the other host's
template still shows the right counts.

Prints nothing where the plugin is not installed. Neither lookup reads a documented
interface: a format change shows nothing rather than something false.

To add the audit to a status line of your own instead, load the same template and call
its `segment(project_dir)`, which returns the segment as a string.
"""
import glob
import json
import os
import runpy
import sys

PLUGIN = "deadweight"
TEMPLATE = os.path.join("skills", "config-auditor", "templates", "statusline.py")


def from_claude():
    home = os.environ.get("CLAUDE_CONFIG_DIR") or os.path.join(os.path.expanduser("~"), ".claude")
    root = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
    try:
        with open(os.path.join(home, "plugins", "installed_plugins.json"), encoding="utf-8") as fh:
            installed = json.load(fh)
    except Exception:
        return None
    pick = None
    for key, entries in (installed.get("plugins") or {}).items():
        if key.split("@")[0] != PLUGIN or not isinstance(entries, list):
            continue
        for e in entries:
            if e.get("projectPath") == root or (pick is None and e.get("scope") == "user"):
                pick = e
    return pick.get("installPath") if pick else None


def from_copilot():
    """The newest deadweight among Copilot's install folders.

    Copilot stores a marketplace install under `installed-plugins/<marketplace>/<plugin>/`
    and a direct one under `installed-plugins/_direct/<source>/`; both can coexist.
    Which one is enabled lives in a file Copilot manages itself, so the newest wins.
    """
    home = os.environ.get("COPILOT_HOME") or os.path.join(os.path.expanduser("~"), ".copilot")
    best, best_key = None, ()
    for manifest in glob.glob(os.path.join(home, "installed-plugins", "*", "*", ".claude-plugin", "plugin.json")):
        try:
            with open(manifest, encoding="utf-8") as fh:
                meta = json.load(fh)
            key = tuple(int(x) for x in str(meta.get("version")).split("-")[0].split("."))
        except Exception:
            continue
        if meta.get("name") == PLUGIN and key > best_key:
            best, best_key = os.path.dirname(os.path.dirname(manifest)), key
    return best


def template():
    order = (from_copilot, from_claude) if sys.argv[1:2] == ["copilot"] else (from_claude, from_copilot)
    for lookup in order:
        base = lookup()
        if base and os.path.isfile(os.path.join(base, TEMPLATE)):
            return os.path.join(base, TEMPLATE)
    return None


found = template()
if found:
    runpy.run_path(found, run_name="__main__")
