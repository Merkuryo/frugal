---
name: frugal
description: Use FIRST for any task beyond one obvious edit - work touching several files, computing over data or logs, research, a design choice, or a problem whose cause is unknown. Orchestrates it at the lowest token cost that still gets a verified result.
---

# Frugal

Goal: a verified result for the fewest tokens. Spend more only where evidence says it pays.

## 1. Size the task first

- **L0 Direct.** One step, obvious answer or edit. Do it, check it, reply. No playbook, no subagent.
- **L1 Standard.** Several steps in one domain. Load one playbook. Subagents only for bulk reading.
- **L2 Deep.** High stakes (irreversible, money, production, public), a contested design, or two L1 attempts failed on the same premise. Playbook + `thinker` + optional two-model panel.

Start at the lowest level that can work. Move up one level only on evidence: a failed attempt, a surprise, a stake that surfaced. State the level in one line, e.g. `L1 · fix`. Never go above the config sheet's `ceiling` without asking.

## 2. Pick one playbook (L1 and up)

| Task | Playbook |
|---|---|
| Make something new (feature, script, app, file) | `playbooks/build.md` |
| Something is broken or wrong | `playbooks/fix.md` |
| Find out, compare, answer with sources | `playbooks/research.md` |
| Document, article, email, report | `playbooks/write.md` |
| Data, numbers, logs, spreadsheets | `playbooks/analyze.md` |
| Choose between options, design, plan | `playbooks/decide.md` |
| Review someone's work or your own | `playbooks/review.md` |

Read only the playbook you picked. At L1+, read `references/principles.md` once per session, and `.frugal/lessons.md` if the project has one.

## 3. Route each phase to the cheapest capable model

| Phase | Who | Default model |
|---|---|---|
| Read, search, skim bulk | `scout` agent | haiku |
| Do: edit, write, run | you or `worker` agent | sonnet |
| Think: diagnose, decide, design | `thinker` agent | opus |
| Check the result | `checker` agent | sonnet |

A config sheet overrides these defaults: `.frugal/config.md` in the project, else `~/.claude/frugal.md`. If subagents are unavailable, do each phase yourself in the same order.

Every brief to a subagent contains: the goal in one line, the minimal facts (paths with line ranges, numbers, error text), the exact question, the output shape and a size cap such as "≤20 lines". Pass paths, never whole files.

## 4. Context discipline

- Locate before reading: search, then read line ranges. Never read a large file whole.
- Do not reread unchanged files or echo tool output back.
- Delegate bulk reading to `scout`; keep only its conclusions.
- When data is large, write a small script that computes the answer instead of reasoning over raw rows.
- When the user switches to an unrelated task in a long session, suggest `/compact` or `/clear`.

## 5. Gates: when to ask the human

Ask before anything irreversible or outward-facing: deleting, overwriting without a backup, force-pushing, sending, publishing, paying, touching production. Also ask at every gate the config sheet lists. Any other open question that running something can answer: run it and decide from the result.

## 6. Verify, then report

Done means shown working on the real artifact: a passing test, a real run, rendered output, a checked source. Report in at most 10 lines unless asked for more: the result, the evidence, open risks. Do not recap the steps.
