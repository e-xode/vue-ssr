#!/usr/bin/env python3
"""Check locale parity between en.json and fr.json.

Recursively extracts all keys from both locale files and reports
any keys present in one but not the other.

Usage:
    python3 .claude/skills/translate/scripts/check_locales.py
    python3 .claude/skills/translate/scripts/check_locales.py --root /path/to/repo

Exits 0 if parity, 1 if mismatch. No external dependencies.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def extract_keys(obj: dict, prefix: str = "") -> set[str]:
    """Recursively extract all leaf key paths from a nested dict."""
    keys = set()
    for key, value in obj.items():
        full_key = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            keys.update(extract_keys(value, full_key))
        else:
            keys.add(full_key)
    return keys


def main() -> int:
    parser = argparse.ArgumentParser(description="Check locale file parity")
    parser.add_argument(
        "--root",
        type=Path,
        default=Path("."),
        help="Repository root path (default: current directory)",
    )
    args = parser.parse_args()

    en_path = args.root / "src" / "translate" / "en.json"
    fr_path = args.root / "src" / "translate" / "fr.json"

    if not en_path.exists():
        print(f"ERROR: {en_path} not found")
        return 1
    if not fr_path.exists():
        print(f"ERROR: {fr_path} not found")
        return 1

    with open(en_path, encoding="utf-8") as f:
        en_data = json.load(f)
    with open(fr_path, encoding="utf-8") as f:
        fr_data = json.load(f)

    en_keys = extract_keys(en_data)
    fr_keys = extract_keys(fr_data)

    only_en = sorted(en_keys - fr_keys)
    only_fr = sorted(fr_keys - en_keys)

    if not only_en and not only_fr:
        print(f"OK: Both locales have {len(en_keys)} keys in parity.")
        return 0

    print("MISMATCH: Locale files are out of sync.\n")

    if only_en:
        print(f"Keys in en.json but missing from fr.json ({len(only_en)}):")
        for key in only_en:
            print(f"  + {key}")
        print()

    if only_fr:
        print(f"Keys in fr.json but missing from en.json ({len(only_fr)}):")
        for key in only_fr:
            print(f"  + {key}")
        print()

    return 1


if __name__ == "__main__":
    sys.exit(main())
