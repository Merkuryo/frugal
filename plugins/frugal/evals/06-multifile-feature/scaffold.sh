#!/usr/bin/env bash
set -euo pipefail
mkdir -p inventory tests
cat > inventory/__init__.py <<'EOF'
EOF
cat > inventory/models.py <<'EOF'
from dataclasses import dataclass


@dataclass
class Item:
    sku: str
    name: str
    unit_price: float
    quantity: int
EOF
cat > inventory/store.py <<'EOF'
from .models import Item


class Store:
    def __init__(self):
        self._items = {}

    def add(self, item: Item):
        if item.sku in self._items:
            self._items[item.sku].quantity += item.quantity
        else:
            self._items[item.sku] = item

    def remove(self, sku: str, quantity: int):
        item = self._items[sku]
        if quantity > item.quantity:
            raise ValueError("not enough stock")
        item.quantity -= quantity
        if item.quantity == 0:
            del self._items[sku]

    def items(self):
        return sorted(self._items.values(), key=lambda i: i.sku)

    def total_value(self) -> float:
        return round(sum(i.unit_price * i.quantity for i in self._items.values()), 2)
EOF
cat > inventory/report.py <<'EOF'
from .store import Store


def format_report(store: Store) -> str:
    lines = [f"{i.sku:<8}{i.name:<20}{i.quantity:>5} x {i.unit_price:>8.2f}" for i in store.items()]
    lines.append(f"TOTAL {store.total_value():.2f}")
    return "\n".join(lines)
EOF
cat > tests/__init__.py <<'EOF'
EOF
cat > tests/test_store.py <<'EOF'
import unittest

from inventory.models import Item
from inventory.report import format_report
from inventory.store import Store


class StoreTest(unittest.TestCase):
    def setUp(self):
        self.store = Store()
        self.store.add(Item("A1", "Widget", 2.50, 4))
        self.store.add(Item("B2", "Gadget", 10.00, 1))

    def test_total(self):
        self.assertEqual(self.store.total_value(), 20.00)

    def test_remove(self):
        self.store.remove("A1", 4)
        self.assertEqual(self.store.total_value(), 10.00)

    def test_report_total_line(self):
        self.assertTrue(format_report(self.store).endswith("TOTAL 20.00"))


if __name__ == "__main__":
    unittest.main()
EOF
