"""
test_compliance.py

Loads compliance_dataset.csv, randomly selects 10 records,
runs each through the Compliance Agent logic, and prints
a formatted report with a final accuracy summary.

Usage:
    python test_compliance.py
    python test_compliance.py --seed 42   # reproducible run
"""

import csv
import random
import argparse
import os
import sys

# ---------------------------------------------------------------------------
# Make sure the project root is on the path so relative imports resolve
# regardless of where this script is invoked from.
# ---------------------------------------------------------------------------
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from agents.compliance.models import ComplianceCheckRequest
from agents.compliance.rules import check_compliance  # noqa: E402

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
DATASET_PATH = os.path.join(os.path.dirname(__file__), "compliance_dataset.csv")
SAMPLE_SIZE = 10
DIVIDER = "-" * 60

# ---------------------------------------------------------------------------
# Destination normalizer
# Maps the human-readable destination names used in the CSV to the canonical
# destination keys that rules.py understands.
# ---------------------------------------------------------------------------
DESTINATION_MAP: dict[str, str] = {
    "authorized e-waste recycler": "recycling_center",
    "authorized oil recycler":     "recycling_center",
    "plastic recycling":           "recycling_center",
    "hazardous treatment facility":"certified_facility",
    "biogas":                      "composting_site",
    "biofuel":                     "composting_site",
    "cement":                      "approved_treatment_plant",
    "brick manufacturing":         "approved_treatment_plant",
    "construction":                "approved_treatment_plant",
    "paper":                       "approved_treatment_plant",
    "unauthorized facility":       "unauthorized_facility",
}

# ---------------------------------------------------------------------------
# Category normalizer
# Maps pollution_category values from the CSV to the keys in REGULATIONS dict.
# ---------------------------------------------------------------------------
CATEGORY_MAP: dict[str, str] = {
    "hazardous":     "hazardous",
    "organic":       "organic",
    "plastic":       "general",
    "industrial":    "general",
    "non-hazardous": "general",
}


def normalize_destination(raw: str) -> str:
    return DESTINATION_MAP.get(raw.strip().lower(), raw.strip().lower())


def normalize_category(raw: str) -> str:
    return CATEGORY_MAP.get(raw.strip().lower(), "general")


def normalize_hazard_level(raw: str) -> str:
    return raw.strip().lower()


# ---------------------------------------------------------------------------
# CSV loading
# ---------------------------------------------------------------------------
def load_dataset(path: str) -> list[dict]:
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def sample_records(records: list[dict], n: int, seed: int | None) -> list[dict]:
    rng = random.Random(seed)
    return rng.sample(records, min(n, len(records)))


# ---------------------------------------------------------------------------
# Record → ComplianceCheckRequest
# ---------------------------------------------------------------------------
def build_request(row: dict, index: int) -> ComplianceCheckRequest:
    return ComplianceCheckRequest(
        waste_profile_id=f"TEST-{index:04d}",
        category=normalize_category(row["pollution_category"]),
        hazard_level=normalize_hazard_level(row["hazard_level"]),
        destination=normalize_destination(row["destination_industry"]),
        transport_mode=None,  # not present in dataset
    )


# ---------------------------------------------------------------------------
# Printing helpers
# ---------------------------------------------------------------------------
def format_list(items: list[str], indent: int = 4) -> str:
    if not items:
        return "None"
    pad = " " * indent
    return ("\n" + pad).join(items)


def print_result(row: dict, predicted_status: str, score: float,
                 violations: list[str], recommendations: list[str]) -> None:
    expected = row["verdict"].strip()
    match_marker = "✓" if expected.lower() == predicted_status.lower() else "✗"

    print(DIVIDER)
    print(f"  Material         : {row['material']}")
    print(f"  Source Industry  : {row['source_industry']}")
    print(f"  Destination      : {row['destination_industry']}")
    print(f"  Expected Verdict : {expected}")
    print(f"  Predicted Verdict: {predicted_status}  {match_marker}")
    print(f"  Compliance Score : {score}")
    print(f"  Violations       : {format_list(violations)}")
    print(f"  Recommendations  : {format_list(recommendations)}")


def print_summary(total: int, passed: int, failed: int, correct: int) -> None:
    accuracy = (correct / total * 100) if total > 0 else 0.0
    print(DIVIDER)
    print("  SUMMARY")
    print(DIVIDER)
    print(f"  Total Tested : {total}")
    print(f"  Passed       : {passed}")
    print(f"  Failed       : {failed}")
    print(f"  Accuracy     : {accuracy:.1f}%  ({correct}/{total} predictions matched expected)")
    print(DIVIDER)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def run(seed: int | None = None) -> None:
    records = load_dataset(DATASET_PATH)
    sample = sample_records(records, SAMPLE_SIZE, seed)

    total = len(sample)
    passed_count = 0
    failed_count = 0
    correct_count = 0

    print(f"\nGreenChain AI — Compliance Agent Test Run")
    print(f"Dataset : {os.path.basename(DATASET_PATH)}  ({len(records)} records)")
    print(f"Sample  : {total}  |  Seed: {seed if seed is not None else 'random'}\n")

    for i, row in enumerate(sample, start=1):
        request = build_request(row, i)
        response = check_compliance(request)

        predicted = response.status          # "PASS" or "FAIL"
        expected = row["verdict"].strip()    # "Pass" or "Fail"

        if predicted == "PASS":
            passed_count += 1
        else:
            failed_count += 1

        if expected.lower() == predicted.lower():
            correct_count += 1

        print_result(
            row=row,
            predicted_status=predicted,
            score=response.compliance_score,
            violations=response.violations,
            recommendations=response.recommendations,
        )

    print_summary(total, passed_count, failed_count, correct_count)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="GreenChain Compliance Agent Test")
    parser.add_argument(
        "--seed", type=int, default=None,
        help="Random seed for reproducible record selection (optional)"
    )
    args = parser.parse_args()
    run(seed=args.seed)
