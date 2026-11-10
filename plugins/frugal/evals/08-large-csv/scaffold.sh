#!/usr/bin/env bash
set -euo pipefail
python3 - <<'EOF'
import csv, random
random.seed(42)
stores = [f"store_{i:02d}" for i in range(1, 41)]
rows = []
for s in stores:
    base = random.uniform(800, 1500)
    for month, factor in (("2026-01", 1.0), ("2026-02", 1.03), ("2026-03", 1.01)):
        f = factor
        if s == "store_17" and month == "2026-03":
            f = 1.03 * 0.62
        for day in range(1, 29):
            for _ in range(4):
                rows.append((f"{month}-{day:02d}", s, round(base / 4 * f * random.uniform(0.9, 1.1), 2)))
random.shuffle(rows)
with open("sales.csv", "w", newline="") as fh:
    w = csv.writer(fh)
    w.writerow(["date", "store", "revenue"])
    w.writerows(rows)
print(len(rows), "rows")
EOF
