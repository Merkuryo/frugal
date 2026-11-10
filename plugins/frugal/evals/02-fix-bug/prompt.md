---
max_turns: 30
timeout_seconds: 400
runs: 3
allowed_tools: [Skill, Agent, Read, Write, Edit, Bash, Glob, Grep]
---

Create `average.py` with exactly this content, then fix it. Users report that `average([])` crashes and that `average([1, 2, 3])` returns the wrong value.

```python
def average(xs):
    total = 0
    for i in range(1, len(xs)):
        total += xs[i]
    return total / len(xs)
```

`average([])` should return `None`.
