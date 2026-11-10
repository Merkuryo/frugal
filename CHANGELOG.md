# Changelog

## 0.1.2

- Stronger trigger: the session hook tells Claude to invoke frugal first on multi-file, data, research, design or unknown-cause tasks, and the skill description leads with "Use FIRST". In the user's test runs frugal then fired on cases 06 and 08.
- New case 09-big-log: root cause buried in a 6 MB log among harmless recovered errors.
- `tools/compare-pstack.sh` runs the same suite against frugal and pstack (each with its no-plugin baseline).
- Case 06: the discount grader now judges the final code in the trace and accepts a helper on Item.

## 0.1.1

- Three multi-step eval cases with scaffolded projects (tag `multistep`): a cross-file feature with tests, a bug whose symptom and cause live in different files, and a ~13k-row CSV analysis.
- First runs showed frugal did not fire on the small cases 01–02, which is by design (L0); their score gap was noise between equivalent arms. The README now says what each group of cases measures.

## 0.1.0

- Router with cost levels (L0/L1/L2), playbook table, model routing by phase, context rules, gates and verification.
- Seven playbooks: build, fix, research, write, analyze, decide, review.
- One-page principles sheet.
- Agents: scout (haiku), worker (sonnet), thinker (opus), checker (sonnet).
- `frugal-setup` config sheet, `frugal-learn` lessons file, token status line, optional session-start pointer.
- Token budget gate, unit tests, five eval cases with a should-not-fire case.
