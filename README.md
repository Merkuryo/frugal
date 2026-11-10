# frugal

**Orchestrate any task with Claude at the lowest token cost that still gets a verified result.**

[Español](README.es.md)

frugal is a plugin for Claude Code and the Claude app. It works for code, writing, research, data analysis and decisions. It does three things:

1. **Sizes every task before spending.** L0 direct, L1 standard, L2 deep. It starts low and moves up only on evidence: a failed attempt, a surprise, a stake that surfaced.
2. **Routes each phase to the cheapest model that can do it.** Haiku reads, Sonnet does, Opus thinks, Sonnet checks. Opus gets a compact brief, not the whole conversation.
3. **Loads guidance only when needed.** A small router, one playbook per task and a one-page sheet of principles. Nothing else sits in context.

## Static cost compared with pstack

Projected token cost from Claude Code's own `claude plugin details`, for frugal 0.1.1 and the Claude Code port of pstack, v0.9.134:

| | frugal | pstack |
|---|---:|---:|
| Added to every session | ~400 | ~4,200 |
| Entry skill, each time it is invoked | ~790 | ~7,100 |
| Skills / agents | 3 / 4 | 67 / 4 |
| All skill text (`node tools/budget.mjs`, characters ÷ 4) | ~3,700 | ~163,000 |

These figures are a **floor**. They only measure what the plugin adds to context, not how well tasks get done. For quality and full-run cost, see [Evals](#evals).

## Install

**Claude Code**

```
/plugin marketplace add Merkuryo/frugal
/plugin install frugal@frugal
```

Then, optionally, run `/frugal-setup` to choose models per phase, add your own approval gates, and turn on the token status line.

**Claude app:** download `frugal.plugin` from the latest release and add it as a plugin. The skills and playbooks work the same way. Where subagents are not available, frugal runs each phase itself in the same order.

## How it works

```
task ─► size it (L0 / L1 / L2) ─► one playbook ─► read (haiku) ─► do (sonnet) ─► think (opus, only if needed) ─► check (sonnet) ─► short report
```

| Piece | What it is |
|---|---|
| `skills/frugal` | The router: levels, playbook table, model routing, context rules, gates, verification |
| `playbooks/` | `build`, `fix`, `research`, `write`, `analyze`, `decide`, `review`, 6–8 steps each |
| `references/principles.md` | About 20 one-line rules: do less, think straight, prove it, spend wisely |
| `agents/` | `scout` (haiku, read-only), `worker` (sonnet), `thinker` (opus), `checker` (sonnet) |
| `frugal-setup` | Writes the config sheet: models, gates, ceiling, session hook, status line |
| `frugal-learn` | Saves up to three one-line lessons per session in `.frugal/lessons.md` |
| `statusline/` | Shows model, tokens in and out, cache and cost in Claude Code's status line |

### Config sheet

`.frugal/config.md` (one project) or `~/.claude/frugal.md` (all projects):

```markdown
# frugal config

scout: haiku
worker: sonnet
thinker: opus
checker: sonnet
panel: off
ceiling: L2
gates: changes to pricing, anything touching production
session hook: on
```

Gates for irreversible or outward-facing actions (delete, force-push, send, publish, pay, production) are always on.

## Evals

`plugins/frugal/evals/` holds cases for Claude Code's built-in evaluator. Each case runs with and without the plugin, so the headline numbers are the score delta and the cost of each arm.

- **Small tasks** (01–05): build a script, fix a bug, analyze inline data, write an email, and a trivial question. frugal is designed to stay out of the way here (L0), so these check that it does not hurt.
- **Multi-step tasks** (06–08, tag `multistep`): a feature that crosses three files of a package with tests, a bug whose symptom and cause live in different files, and an analysis over a ~13,000-row CSV on disk. Each one sets up its files with a `scaffold.sh` script. These are where frugal should engage and save tokens.

```
# multi-step cases (scaffold scripts create the project files)
claude plugin eval ./plugins/frugal --tag multistep --scaffold --allow-tools Write Edit Bash --no-publish

# everything
claude plugin eval ./plugins/frugal --scaffold --allow-tools Write Edit Bash --no-publish
```

Start with `--runs 1` to check that frugal fires (the `router-fired` indicator), then use the default 3 runs for numbers you can trust.

No results are published yet. Contributions of runs, especially head-to-head against other stacks, are welcome. Please include `aggregate-result.json`.

## Develop

```
node --test tests/*.test.mjs                                   # unit tests
node tools/budget.mjs plugins/frugal --entry frugal --check    # token budget gate
claude plugin validate plugins/frugal                          # manifest and components
```

CI runs all three on every push. A change that breaks the token budget fails the build.

## Credits

Several principles and the playbook idea are adapted from [pstack](https://github.com/michael-denyer/pstack-claude) by Lauren Tan (poteto), MIT licensed. See [NOTICE.md](NOTICE.md).

## License

MIT
