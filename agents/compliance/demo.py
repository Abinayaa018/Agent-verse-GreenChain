"""
demo.py

Interactive CLI demo for the GreenChain AI Compliance Agent.
Collects waste information from the user, runs the hybrid rule engine
+ ML compliance check, and prints a professional compliance report.

Usage:
    python agents/compliance/demo.py
"""

import os
import sys
import uuid
import warnings

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# Path setup — works from any working directory
# ---------------------------------------------------------------------------
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from agents.compliance.models import ComplianceCheckRequest
from agents.compliance.rules import check_compliance

# Import ML predictor from agent module (loads model once)
try:
    from agents.compliance.agent import _predict_confidence, _combine
    ML_AVAILABLE = True
except Exception:
    ML_AVAILABLE = False

# ---------------------------------------------------------------------------
# Valid input options shown to the user
# ---------------------------------------------------------------------------
VALID_MATERIALS = [
    "Food Waste", "Used Oil", "Plastic Scrap", "Chemical Sludge",
    "Paper Sludge", "E-Waste", "Rice Husk", "Polyester Scrap",
    "Fly Ash", "Bagasse", "Steel Slag", "Cotton Scrap", "Other",
]

VALID_INDUSTRIES = [
    "Food", "Automotive", "Packaging", "Chemical", "Paper",
    "Electronics", "Agriculture", "Textile", "Thermal Power",
    "Sugar", "Steel", "Other",
]

VALID_DESTINATIONS = [
    "Authorized Recycler",
    "Certified Facility",
    "Composting Site",
    "Approved Treatment Plant",
    "Landfill",
    "Unauthorized Facility",
    "Open Dump",
]

VALID_HAZARD_LEVELS = ["Low", "Medium", "High"]

VALID_TRANSPORT_MODES = ["Road", "Rail", "Sea", "None"]

# ---------------------------------------------------------------------------
# Destination normalizer — maps user choice to canonical rule-engine keys
# ---------------------------------------------------------------------------
DESTINATION_MAP: dict[str, str] = {
    "authorized recycler":        "recycling_center",
    "certified facility":         "certified_facility",
    "composting site":            "composting_site",
    "approved treatment plant":   "approved_treatment_plant",
    "landfill":                   "landfill",
    "unauthorized facility":      "unauthorized_facility",
    "open dump":                  "open_dump",
}

# ---------------------------------------------------------------------------
# Category inference from material
# ---------------------------------------------------------------------------
MATERIAL_TO_CATEGORY: dict[str, str] = {
    "food waste":      "organic",
    "rice husk":       "organic",
    "bagasse":         "organic",
    "used oil":        "hazardous",
    "chemical sludge": "chemical",
    "e-waste":         "electronic",
    "plastic scrap":   "general",
    "polyester scrap": "general",
    "paper sludge":    "general",
    "fly ash":         "general",
    "steel slag":      "general",
    "cotton scrap":    "general",
    "other":           "general",
}

# ---------------------------------------------------------------------------
# Display helpers
# ---------------------------------------------------------------------------
BORDER = "=" * 36
THIN   = "-" * 36


def _header() -> None:
    print(f"\n{BORDER}")
    print("       GREENCHAIN AI")
    print("       Compliance Agent Demo")
    print(BORDER)


def _section(label: str, value: str) -> None:
    print(f"\n  {label}")
    print(f"  {value}")


def _prompt_choice(question: str, options: list[str]) -> str:
    """Displays a numbered menu and returns the user's chosen string."""
    print(f"\n  {question}")
    for i, opt in enumerate(options, 1):
        print(f"    {i}. {opt}")
    while True:
        raw = input("  Enter number: ").strip()
        if raw.isdigit() and 1 <= int(raw) <= len(options):
            return options[int(raw) - 1]
        print(f"  Invalid choice. Enter a number between 1 and {len(options)}.")


def _prompt_float(question: str, low: float, high: float) -> float:
    """Prompts for a float within [low, high]."""
    while True:
        raw = input(f"\n  {question} ({low}–{high}): ").strip()
        try:
            val = float(raw)
            if low <= val <= high:
                return val
            print(f"  Please enter a value between {low} and {high}.")
        except ValueError:
            print("  Invalid input. Please enter a number.")


def _prompt_text(question: str) -> str:
    while True:
        raw = input(f"\n  {question}: ").strip()
        if raw:
            return raw
        print("  This field cannot be empty.")


# ---------------------------------------------------------------------------
# Input collection
# ---------------------------------------------------------------------------
def collect_inputs() -> dict:
    print(f"\n{THIN}")
    print("  Please provide waste information")
    print(THIN)

    material        = _prompt_choice("Material type:", VALID_MATERIALS)
    source_industry = _prompt_choice("Source industry:", VALID_INDUSTRIES)
    destination     = _prompt_choice("Destination facility:", VALID_DESTINATIONS)
    quantity        = _prompt_float("Quantity (tons)", 0.1, 10000.0)
    purity          = _prompt_float("Purity (%)", 0.0, 100.0)
    hazard_level    = _prompt_choice("Hazard level:", VALID_HAZARD_LEVELS)
    transport_mode  = _prompt_choice("Transport mode:", VALID_TRANSPORT_MODES)
    submitted_docs  = _prompt_text("Submitted documents (comma-separated)")

    return {
        "material":        material,
        "source_industry": source_industry,
        "destination":     destination,
        "quantity":        quantity,
        "purity":          purity,
        "hazard_level":    hazard_level,
        "transport_mode":  transport_mode,
        "submitted_docs":  [d.strip() for d in submitted_docs.split(",")],
    }


# ---------------------------------------------------------------------------
# Build ComplianceCheckRequest from user inputs
# ---------------------------------------------------------------------------
def build_request(inputs: dict) -> ComplianceCheckRequest:
    category = MATERIAL_TO_CATEGORY.get(inputs["material"].lower(), "general")
    destination_key = DESTINATION_MAP.get(inputs["destination"].lower(), "unauthorized_facility")
    transport = None if inputs["transport_mode"].lower() == "none" else inputs["transport_mode"].lower()

    return ComplianceCheckRequest(
        waste_profile_id=f"DEMO-{uuid.uuid4().hex[:8].upper()}",
        category=category,
        hazard_level=inputs["hazard_level"].lower(),
        destination=destination_key,
        transport_mode=transport,
    )


# ---------------------------------------------------------------------------
# Document gap check
# ---------------------------------------------------------------------------
def _check_document_gaps(submitted: list[str], required: list[str]) -> list[str]:
    """Returns required documents that were not submitted."""
    submitted_lower = {d.lower() for d in submitted}
    return [doc for doc in required if doc.lower() not in submitted_lower]


# ---------------------------------------------------------------------------
# Report printer
# ---------------------------------------------------------------------------
def print_report(inputs: dict, request: ComplianceCheckRequest, response) -> None:
    status_label = "✅  PASS" if response.status == "PASS" else "❌  FAIL"
    score_pct    = f"{int(response.compliance_score)}%"
    confidence_pct = f"{int(response.confidence * 100)}%"

    permits = ", ".join(response.permit_required) if response.permit_required else "None"
    violations = response.violations if response.violations else ["None"]
    req_docs = ", ".join(response.required_documents) if response.required_documents else "None"
    recommendations = response.recommendations if response.recommendations else ["None"]

    missing_docs = _check_document_gaps(inputs["submitted_docs"], response.required_documents)
    doc_status = (
        "All required documents submitted."
        if not missing_docs
        else f"Missing: {', '.join(missing_docs)}"
    )

    print(f"\n{BORDER}")
    print("         GREENCHAIN AI")
    print("        Compliance Report")
    print(BORDER)

    _section("Reference ID:",       request.waste_profile_id)
    _section("Material:",           inputs["material"])
    _section("Source Industry:",    inputs["source_industry"])
    _section("Destination:",        inputs["destination"])
    _section("Quantity:",           f"{inputs['quantity']} tons")
    _section("Purity:",             f"{inputs['purity']}%")
    _section("Hazard Level:",       inputs["hazard_level"])

    print(f"\n{THIN}")

    _section("Compliance Status:",  status_label)
    _section("Compliance Score:",   score_pct)
    _section("Confidence:",         confidence_pct)
    _section("Permit Required:",    permits)

    print(f"\n{THIN}")

    print("\n  Violations:")
    for v in violations:
        print(f"    • {v}")

    print("\n  Required Documents:")
    print(f"    {req_docs}")

    print("\n  Document Status:")
    print(f"    {doc_status}")

    print("\n  Recommendations:")
    for r in recommendations:
        print(f"    • {r}")

    print(f"\n{BORDER}\n")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> None:
    _header()

    while True:
        inputs = collect_inputs()
        request = build_request(inputs)

        print(f"\n  Running compliance check...")

        # Step 1 — rule engine
        rule_result = check_compliance(request)

        # Step 2 — ML prediction + combine (if model is available)
        if ML_AVAILABLE:
            confidence = _predict_confidence(request)
            response = _combine(rule_result, confidence)
        else:
            response = rule_result  # rule-engine-only fallback

        print_report(inputs, request, response)

        again = input("  Run another check? (yes / no): ").strip().lower()
        if again not in ("yes", "y"):
            print("\n  Thank you for using GreenChain AI Compliance Agent.\n")
            break


if __name__ == "__main__":
    main()
