#!/usr/bin/env bash
set -euo pipefail
mkdir -p billing data
cat > billing/__init__.py <<'EOF'
EOF
cat > data/rates.csv <<'EOF'
currency,per_usd
USD,1.00
EUR,0.92
GBP,0.79
EOF
cat > billing/rates.py <<'EOF'
import csv
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data" / "rates.csv"


def load_rates(path=DATA):
    rates = {}
    with open(path, newline="") as fh:
        for row in csv.DictReader(fh):
            value = float(row["per_usd"])
            # legacy files stored percentages; normalise everything to percent
            rates[row["currency"]] = value * 100 if row["currency"] != "USD" else value
    return rates
EOF
cat > billing/invoice.py <<'EOF'
from .rates import load_rates


def invoice_total(lines, currency):
    rates = load_rates()
    usd = sum(qty * unit_usd for qty, unit_usd in lines)
    return round(usd * rates[currency], 2)


if __name__ == "__main__":
    order = [(2, 15.00), (1, 70.00)]
    for cur in ("USD", "EUR", "GBP"):
        print(cur, invoice_total(order, cur))
EOF
