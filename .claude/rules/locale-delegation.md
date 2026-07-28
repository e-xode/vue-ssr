---
paths:
  - 'src/translate/**'
---

# Locale files — STOP

**Never edit locale JSON files directly** — delegate to the `translate` agent.

**Exception — you are the `translate` agent:** this rule does not apply to you; you are the owner. Everyone else: report the key, never write it.

`src/translate/en.json` and `src/translate/fr.json` must stay in strict key parity. Editing one file inline is how parity silently breaks: the missing key renders as its own path in the UI, and no test catches it.

If you are the orchestrator: delegate to the `translate` agent.
If you are any other sub-agent: report the needed key and its EN/FR values in your structured return — the orchestrator will delegate.

This applies to every operation (add/edit/rename/delete keys, bulk parity audits) including the email templates under `src/translate/emails/`.

Full pipeline: skill `translate` (key naming, interpolation, parity script).
