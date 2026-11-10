---
name: frugal-setup
description: Configures the frugal plugin - which model handles each phase, which actions always need the human's approval, the session-start nudge and the token status line. Use when the user asks to set up, configure or tune frugal.
disable-model-invocation: true
---

# Frugal setup

Write a config sheet that the `frugal` skill reads. Ask with `AskUserQuestion` when available, otherwise in plain text, one group at a time, offering the default first.

## Steps

1. **Scope.** Ask: all projects (`~/.claude/frugal.md`) or only this project (`.frugal/config.md`). A project sheet replaces the user sheet in that project.
2. **Models per phase.** Defaults: `scout: haiku`, `worker: sonnet`, `thinker: opus`, `checker: sonnet`. Offer `inherit` (run on the session's model) for any of them. Offer a reasoning effort suffix such as `opus @high`.
3. **Panel.** Default `panel: off`. With `on`, L2 decisions get one second opinion from a different model. Never more than two opinions.
4. **Gates.** The built-in gates (irreversible or outward-facing actions) always apply. Ask for extra gates in the user's words, e.g. "changes to pricing", "anything touching production".
5. **Ceiling.** Ask the highest level frugal may reach without asking: `L1` or `L2` (default `L2`).
6. **Session nudge.** Default `session hook: on` (about 120 tokens per session that point to frugal). `off` saves them; the user then invokes `/frugal` by hand.
7. **Write the sheet**, overwriting it entirely:

```markdown
# frugal config

scout: haiku
worker: sonnet
thinker: opus
checker: sonnet
panel: off
ceiling: L2
gates: <comma-separated extra gates, or none>
session hook: on
```

8. **Claude Code extras (offer, do not force).**
   - Main model: suggest `"model": "opusplan"` in `~/.claude/settings.json`, so plan mode thinks on Opus and execution runs on Sonnet.
   - Token status line: if Node is installed, add to `~/.claude/settings.json`:
     `"statusLine": {"type": "command", "command": "node <plugin-root>/statusline/frugal-status.mjs"}` with `<plugin-root>` resolved to this plugin's absolute path.
   Show the exact JSON change and apply it only after the user agrees. Keep every existing key.
9. **Confirm** in ≤5 lines: where the sheet is, what changed, how to rerun.

In the Claude app there is no settings file: write nothing there, and tell the user the defaults apply, or that they can paste the sheet into their project instructions.
