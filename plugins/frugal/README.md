# frugal

Orchestrates any task with Claude (code, writing, research, data, decisions) at the lowest token cost that still gets a verified result. It sizes each task (L0 direct, L1 standard, L2 deep) and escalates only on evidence. It routes reading to Haiku, doing to Sonnet, thinking to Opus and checking to Sonnet, and loads one short playbook per task instead of a large instruction set.

Use `/frugal` for any multi-step task, `/frugal-setup` to configure models, gates and the token status line, and `/frugal-learn` to save lessons from a session.

Full documentation: see the repository README.

Install in Claude Code:

    /plugin install frugal --marketplace Merkuryo/frugal
