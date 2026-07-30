"""
demo.py

Interactive CLI demo for the GreenChain AI Economic Value Agent.
Collects waste transaction details, runs the rule-based evaluation,
then enhances the profitability prediction with the trained ML model.

Usage:
    python agents/economic_value/demo.py
"""

import os
import sys
import uuid
import warnings
import importlib.util
import pathlib
import types

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# Path setup
# ---------------------------------------------------------------------------
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Load models and pricing without triggering __init__.py (avoids uagents import)
_base = pathlib.Path(__file__).parent
_pkg  = "agents.economic_value"

if _pkg not in sys.modules:
    _stub = types.ModuleType(_pkg)
    _stub.__path__   = [str(_base)]
    _stub.__package__ = _pkg
    sys.modules[_pkg] = _stub

def _load_module(module_name, path):
    spec = importlib.util.spec_from_file_location(module_name, path)
    mod  = importlib.util.module_from_spec(spec)
    mod.__package__ = _pkg
    sys.modules[module_name] = mod
    spec.loader.exec_module(mod)
    return mod

_models  = _load_module(f"{_pkg}.models",  _base / "models.py")
_pricing = _load_module(f"{_pkg}.pricing", _base / "pricing.py")

EconomicValueRequest = _models.EconomicValueRequest
evaluate             = _pricing.evaluate

# ---------------------------------------------------------------------------
# ML model loader
# ---------------------------------------------------------------------------
import joblib
import numpy as np

BASE_DIR      = os.path.dirname(__file__)
MODEL_PATH    = os.path.join(BASE_DIR, "economic_model.joblib")
ENCODERS_PATH = os.path.join(BASE_DIR, "eco_encoders.joblib")
SCALER_PATH   = os.path.join(BASE_DIR, "eco_scaler.joblib")

CATEGORICAL_COLUMNS = ["material", "source_industry", "destination_industry"]
NUMERICAL_COLUMNS   = [
    "quantity_tons", "purity", "transport_distance_km",
    "market_price_per_ton", "processing_cost_per_ton", "transport_cost_per_km",
    "revenue", "processing_cost", "transport_cost",
    "total_cost", "net_profit", "roi_percent",
]

def _load_ml_artifacts():
    if not all(os.path.exists(p) for p in [MODEL_PATH, ENCODERS_PATH, SCALER_PATH]):
        return None, None, None
    model    = joblib.load(MODEL_PATH)
    encoders = joblib.load(ENCODERS_PATH)
    scaler   = joblib.load(SCALER_PATH)
    return model, encoders, scaler

_ML_MODEL, _ENCODERS, _SCALER = _load_ml_artifacts()
ML_AVAILABLE = _ML_MODEL is not None


def _encode_safe(encoder, value: str) -> int:
    try:
        return int(encoder.transform([value])[0])
    except ValueError:
        return 0


def ml_predict(request: EconomicValueRequest, response) -> tuple[str, float]:
    """
    Returns (predicted_profitability, confidence_probability).
    Falls back to rule-based result if model is unavailable.
    """
    if not ML_AVAILABLE:
        return response.profitability, 1.0

    cat_encoders = _ENCODERS["categorical"]

    cat_values = [
        _encode_safe(cat_encoders[col], request.material)        if col == "material"             else
        _encode_safe(cat_encoders[col], request.source_industry) if col == "source_industry"      else
        _encode_safe(cat_encoders[col], request.destination_industry)
        for col in CATEGORICAL_COLUMNS
    ]

    num_values = [
        request.quantity_tons,
        request.purity,
        request.transport_distance_km,
        response.market_price_per_ton,
        0.0,                          # processing_cost_per_ton — not stored on response
        0.0,                          # transport_cost_per_km   — not stored on response
        response.revenue,
        response.processing_cost,
        response.transport_cost,
        response.total_cost,
        response.net_profit,
        response.roi_percent,
    ]

    num_array  = np.array([num_values], dtype=np.float32)
    num_scaled = _SCALER.transform(num_array)[0].tolist()

    features   = np.array([cat_values + num_scaled], dtype=np.float32)
    proba      = _ML_MODEL.predict_proba(features)[0]
    pred_idx   = int(np.argmax(proba))
    confidence = float(proba[pred_idx])

    label_encoder = _ENCODERS["target"]
    predicted     = label_encoder.inverse_transform([pred_idx])[0]

    return predicted, round(confidence, 4)


# ---------------------------------------------------------------------------
# Valid input options
# ---------------------------------------------------------------------------
VALID_MATERIALS = [
    "Plastic Scrap", "Fly Ash", "Steel Slag", "Chemical Sludge",
    "Glass Waste", "Rice Husk", "Bagasse", "Food Waste",
    "E-Waste", "Used Oil", "Cotton Scrap", "Paper Sludge", "Other",
]

VALID_SOURCE_INDUSTRIES = [
    "Packaging", "Thermal Power", "Steel", "Chemical",
    "Glass", "Agriculture", "Sugar", "Food",
    "Electronics", "Automotive", "Textile", "Paper", "Other",
]

VALID_DESTINATION_INDUSTRIES = [
    "Plastic Recycling", "Cement", "Construction",
    "Hazardous Treatment Facility", "Glass Recycling",
    "Biofuel", "Paper", "Biogas",
    "Authorized E-Waste Recycler", "Authorized Oil Recycler",
    "Brick Manufacturing", "Unauthorized Facility",
]

# ---------------------------------------------------------------------------
# Display helpers
# ---------------------------------------------------------------------------
BORDER = "=" * 42
THIN   = "-" * 42


def _header() -> None:
    print(f"\n{BORDER}")
    print("         GREENCHAIN AI")
    print("      Economic Value Agent Demo")
    print(BORDER)
    ml_status = "ML model loaded" if ML_AVAILABLE else "Rule-based mode (no model found)"
    print(f"  Status   : {ml_status}")
    print(f"  Currency : INR (Rs.)")
    print(THIN)


def _prompt_choice(question: str, options: list[str]) -> str:
    print(f"\n  {question}")
    for i, opt in enumerate(options, 1):
        print(f"    {i:>2}. {opt}")
    while True:
        raw = input("  Enter number: ").strip()
        if raw.isdigit() and 1 <= int(raw) <= len(options):
            return options[int(raw) - 1]
        print(f"  Invalid. Enter 1 to {len(options)}.")


def _prompt_float(question: str, low: float, high: float) -> float:
    while True:
        raw = input(f"\n  {question} ({low}–{high}): ").strip()
        try:
            val = float(raw)
            if low <= val <= high:
                return val
            print(f"  Enter a value between {low} and {high}.")
        except ValueError:
            print("  Invalid input. Enter a number.")


# ---------------------------------------------------------------------------
# Input collection
# ---------------------------------------------------------------------------
def collect_inputs() -> dict:
    print(f"\n{THIN}")
    print("  Enter waste transaction details")
    print(THIN)

    material             = _prompt_choice("Material type:",             VALID_MATERIALS)
    source_industry      = _prompt_choice("Source industry:",           VALID_SOURCE_INDUSTRIES)
    destination_industry = _prompt_choice("Destination industry:",      VALID_DESTINATION_INDUSTRIES)
    quantity_tons        = _prompt_float("Quantity (tons)",             0.1, 10_000.0)
    purity               = _prompt_float("Purity (%)",                  0.0, 100.0)
    transport_distance   = _prompt_float("Transport distance (km)",     1.0, 5_000.0)

    return {
        "material":             material,
        "source_industry":      source_industry,
        "destination_industry": destination_industry,
        "quantity_tons":        quantity_tons,
        "purity":               purity,
        "transport_distance_km": transport_distance,
    }


def build_request(inputs: dict) -> EconomicValueRequest:
    return EconomicValueRequest(
        waste_profile_id=f"DEMO-{uuid.uuid4().hex[:8].upper()}",
        material=inputs["material"],
        source_industry=inputs["source_industry"],
        destination_industry=inputs["destination_industry"],
        quantity_tons=inputs["quantity_tons"],
        purity=inputs["purity"],
        transport_distance_km=inputs["transport_distance_km"],
    )


# ---------------------------------------------------------------------------
# Report printer
# ---------------------------------------------------------------------------
def print_report(request: EconomicValueRequest, response, ml_profitability: str, confidence: float) -> None:
    rule_match = "[MATCH]" if response.profitability == ml_profitability else "[DIFFER]"

    print(f"\n{BORDER}")
    print("         GREENCHAIN AI")
    print("       Economic Value Report")
    print(BORDER)
    print(f"\n  Reference ID        : {request.waste_profile_id}")
    print(f"  Material            : {request.material}")
    print(f"  Source Industry     : {request.source_industry}")
    print(f"  Destination         : {request.destination_industry}")
    print(f"  Quantity            : {request.quantity_tons} tons")
    print(f"  Purity              : {request.purity}%")
    print(f"  Distance            : {request.transport_distance_km} km")

    print(f"\n{THIN}")
    print("  FINANCIAL BREAKDOWN")
    print(THIN)
    print(f"  Market Price/ton    : Rs. {response.market_price_per_ton:>14,.2f}")
    print(f"  Revenue             : Rs. {response.revenue:>14,.2f}")
    print(f"  Processing Cost     : Rs. {response.processing_cost:>14,.2f}")
    print(f"  Transport Cost      : Rs. {response.transport_cost:>14,.2f}")
    print(f"  Total Cost          : Rs. {response.total_cost:>14,.2f}")
    print(f"  Net Profit          : Rs. {response.net_profit:>14,.2f}")
    print(f"  ROI                 : {response.roi_percent:>11.2f}%")

    print(f"\n{THIN}")
    print("  PROFITABILITY ASSESSMENT")
    print(THIN)
    print(f"  Rule-based          : {response.profitability}")
    print(f"  ML Prediction       : {ml_profitability}  {rule_match}")
    print(f"  ML Confidence       : {confidence:.2%}")
    print(f"  Recommendation      : {response.recommendation}")

    print(f"\n{BORDER}\n")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> None:
    _header()

    while True:
        inputs   = collect_inputs()
        request  = build_request(inputs)

        print("\n  Evaluating transaction...")
        response = evaluate(request)

        ml_profitability, confidence = ml_predict(request, response)

        print_report(request, response, ml_profitability, confidence)

        again = input("  Evaluate another transaction? (yes / no): ").strip().lower()
        if again not in ("yes", "y"):
            print("\n  Thank you for using GreenChain AI Economic Value Agent.\n")
            break


if __name__ == "__main__":
    main()
