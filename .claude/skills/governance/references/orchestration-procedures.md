# Orchestration procedures

Mechanics behind `CLAUDE.md` § Sub-agent orchestration's task-tracking line. Lives here rather
than in `CLAUDE.md` because it is harness mechanics, not a hard rule — and `CLAUDE.md` is paid for
on every turn whether or not a task needs it.

## Tracking incoming requests

A new user request arriving while another is `in_progress` is `TaskCreate`d immediately. Never
leave a request untracked, and never silently serialise it behind the current one.

**Overlap means write-set overlap** — a file either task would modify. Reads never conflict.

- **No write-set overlap** → launch it immediately, unprompted. Do not wait for a go-ahead.
- **Real overlap** → `addBlockedBy` the in-flight task. It resumes automatically the moment that
  task completes.
- **On every task completion** → re-sweep the pending list and launch anything that is now clear,
  the same way.

The subtle case is a single `.vue` file: its template and its `<script setup>` are one write-set,
even though different concerns may own different regions of it. Two agents editing one file
concurrently is a lost update, not parallelism. Sequence them, or hand the whole file to one agent.
This is the same test as `CLAUDE.md` § Sub-agent orchestration rule 3 ("Fleet — split by
independent file boundaries"), extended across time instead of just across a single fan-out.

### Project-specific refinements

These go beyond the canonical pattern above and must be preserved when re-deriving this file:

- **Read-only research is allowed while blocked.** A queued (`addBlockedBy`) task may still be
  investigated — reading files, searching, forming a plan — while it waits. Only writes are
  gated on the blocking task completing.
- **`CHANGELOG.md`'s `## [Unreleased]` section is exempt from the overlap test.** Two tasks both
  appending a changelog entry are not a write-set conflict — the Task completion protocol already
  curates entries there sequentially per task, so this file never blocks parallelization on its
  own.
- **`validation` always waits for every task to leave `in_progress`.** Even if a task's own
  footprint doesn't overlap the file(s) another task is validating, `validation` never runs
  concurrently with any `in_progress` task — it is a single always-last gate, not a
  per-write-set one.
- **Announce queuing in one line, never ask.** Blocking a task is decided unilaterally and stated,
  not proposed as a question.
