"""
test_economic.py

Loads economic_dataset.csv, randomly samples 20 records,
runs each through the Economic Value Agent logic, and prints
a formatted report with a final summary.

Usage:
    python test_economic.py
    python test_economic.py --seed 42   # reproducible run
"""

import csv
import random
import argparse
import os
import sys

# ---------------------------------------------------------------------------
# Ensure project root is on the path regardless of invocation directory.
# ---------------------------------------------------------------------------
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Import directly from source files to avoid pulling in uagents via __init__.py.
# pricing.py uses a relative import (from .models import ...), so we must register
# both modules under the package namespace before loading pricing.
import importlib.util, pathlib, types

_base    = pathlib.Path(__file__).parent
_pkg     = "agents.economic_value"

# Create a lightweight package stub so relative imports resolve correctly.
if _pkg not in sys.modules:
    _stub = types.ModuleType(_pkg)
    _stub.__path__ = [str(_base)]
    _stub.__package__ = _pkg
    sys.modules[_pkg] = _stub

def _load(module_name, path):
    spec = importlib.util.spec_from_file_location(module_name, path)
    mod  = importlib.util.module_from_spec(spec)
    mod.__package__ = _pkg
    sys.modules[module_name] = mod
    spec.loader.exec_module(mod)
    return mod

_models  = _load(f"{_pkg}.models",  _base / "models.py")
_pricing = _load(f"{_pkg}.pricing", _base / "pricing.py")

EconomicValueRequest = _models.EconomicValueRequest
evaluate             = _pricing.evaluate

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
DATASET_PATH = os.path.join(os.path.dirname(__file__), "economic_dataset.csv")
SAMPLE_SIZE  = 20
DIVIDER      = "-" * 60

# ---------------------------------------------------------------------------
# Dataset helpers
# ---------------------------------------------------------------------------

def load_dataset(path: str) -> list[dict]:
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def sample_records(records: list[dict], n: int, seed: int | None) -> list[dict]:
    rng = random.Random(seed)
    return rng.sample(records, min(n, len(records)))


# ---------------------------------------------------------------------------
# Record → EconomicValueRequest
# ---------------------------------------------------------------------------

def build_request(row: dict, index: int) -> EconomicValueRequest:
    return EconomicValueRequest(
        waste_profile_id=f"TEST-{index:04d}",
        material=row["material"].strip(),
        source_industry=row["source_industry"].strip(),
        destination_industry=row["destination_industry"].strip(),
        quantity_tons=float(row["quantity_tons"]),
        purity=float(row["purity"]),
        transport_distance_km=float(row["transport_distance_km"]),
    )


# ---------------------------------------------------------------------------
# Print helpers
# ---------------------------------------------------------------------------

def print_record(index: int, row: dict, response) -> None:
    expected  = row["profitability"].strip()
    predicted = response.profitability
    match     = "[PASS]" if expected == predicted else "[FAIL]"

    print(DIVIDER)
    print(f"  Record              : {index}")
    print(f"  Material            : {row['material']}")
    print(f"  Quantity            : {row['quantity_tons']} tons")
    print(f"  Revenue             : Rs. {response.revenue:,.2f}")
    print(f"  Processing Cost     : Rs. {response.processing_cost:,.2f}")
    print(f"  Transport Cost      : Rs. {response.transport_cost:,.2f}")
    print(f"  Total Cost          : Rs. {response.total_cost:,.2f}")
    print(f"  Net Profit          : Rs. {response.net_profit:,.2f}")
    print(f"  ROI                 : {response.roi_percent:.2f}%")
    print(f"  Expected Profitabil.: {expected}")
    print(f"  Predicted Profitabil: {predicted}  {match}")
    print(f"  Recommendation      : {response.recommendation}")


def print_summary(
    total: int,
    correct: int,
    incorrect: int,
    avg_roi: float,
    avg_net_profit: float,
    prediction_counts: dict[str, int],
) -> None:
    accuracy = (correct / total * 100) if total > 0 else 0.0

    print(DIVIDER)
    print("  SUMMARY")
    print(DIVIDER)
    print(f"  Total Tested        : {total}")
    print(f"  Correct Predictions : {correct}")
    print(f"  Incorrect Predictions: {incorrect}")
    print(f"  Average ROI         : {avg_roi:.2f}%")
    print(f"  Average Net Profit  : Rs. {avg_net_profit:,.2f}")
    print(f"  Overall Accuracy    : {accuracy:.1f}%  ({correct}/{total})")
    print(DIVIDER)
    print("  PREDICTION SUMMARY")
    print(DIVIDER)
    for category, count in sorted(prediction_counts.items()):
        print(f"  {category:<20}: {count}")
    print(DIVIDER)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def run(seed: int | None = None) -> None:
    records = load_dataset(DATASET_PATH)
    sample  = sample_records(records, SAMPLE_SIZE, seed)

    total             = len(sample)
    correct_count     = 0
    incorrect_count   = 0
    total_roi         = 0.0
    total_net_profit  = 0.0
    prediction_counts: dict[str, int] = {}

    print(f"\nGreenChain AI — Economic Value Agent Test Run")
    print(f"Dataset : {os.path.basename(DATASET_PATH)}  ({len(records)} records)")
    print(f"Sample  : {total}  |  Seed: {seed if seed is not None else 'random'}\n")

    for i, row in enumerate(sample, start=1):
        request  = build_request(row, i)
        response = evaluate(request)

        expected  = row["profitability"].strip()
        predicted = response.profitability

        if expected == predicted:
            correct_count += 1
        else:
            incorrect_count += 1

        total_roi        += response.roi_percent
        total_net_profit += response.net_profit
        prediction_counts[predicted] = prediction_counts.get(predicted, 0) + 1

        print_record(i, row, response)

    avg_roi        = total_roi / total if total > 0 else 0.0
    avg_net_profit = total_net_profit / total if total > 0 else 0.0

    print_summary(
        total=total,
        correct=correct_count,
        incorrect=incorrect_count,
        avg_roi=avg_roi,
        avg_net_profit=avg_net_profit,
        prediction_counts=prediction_counts,
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="GreenChain Economic Value Agent Test")
    parser.add_argument(
        "--seed", type=int, default=None,
        help="Random seed for reproducible record selection (optional)"
    )
    args = parser.parse_args()
    run(seed=args.seed)
