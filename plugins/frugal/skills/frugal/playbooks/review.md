# Review: someone's work or your own

1. **Scope and bar.** What is under review and the standard it must meet: correctness, clarity, safety, the stated goal.
2. **Read the diff or the changed parts**, not everything. `scout` maps where the changes reach.
3. **Check behavior, not style first.** Does it do what it claims? Run it or its tests when possible.
4. **Findings, ranked.** Each: severity (blocker / should / nit), location, the concrete failure it causes, a suggested fix. Drop nits unless asked.
5. **Verify your own claims.** Confirm each blocker with evidence before reporting it.
6. **Report.** Verdict in one line, then blockers, then the rest.
