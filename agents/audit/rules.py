import os
import json
from datetime import datetime
from .models import ESGReportInput, ESGReportResult

LEDGER_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "esg_ledger.json")

# Same sourced factors as Environmental Impact Agent — kept consistent
# across agents so audit totals match what Environmental Impact reports
# per-transaction. Sourced from EPA WARM (Waste Reduction Model):
# https://www.epa.gov/warm/versions-waste-reduction-model
EMISSION_FACTORS = {
    "metal": 10.07, "plastic": 1.05, "battery": 1.50, "biological": 0.25,
    "cardboard": 0.94, "clothes": 3.80, "glass": 0.31, "paper": 0.94,
    "shoes": 3.80, "trash": 0.00,
}


def load_ledger() -> dict:
    if not os.path.exists(LEDGER_PATH):
        return {}
    with open(LEDGER_PATH, "r") as f:
        return json.load(f)


def save_ledger(ledger: dict):
    os.makedirs(os.path.dirname(LEDGER_PATH), exist_ok=True)
    with open(LEDGER_PATH, "w") as f:
        json.dump(ledger, f, indent=2)


def record_transaction(company_name: str, material_type: str, quantity_kg: float, contract_id: str) -> dict:
    material = material_type.lower()
    co2_factor = EMISSION_FACTORS.get(material, 0.5)

    entry = {
        "contract_id": contract_id,
        "material_type": material,
        "quantity_kg": quantity_kg,
        "co2_saved_kg": round(quantity_kg * co2_factor, 2),
        "landfill_diverted_kg": round(quantity_kg * 0.9, 2),
        "timestamp": datetime.now().isoformat(timespec="seconds"),
    }

    ledger = load_ledger()
    company_entries = ledger.get(company_name, [])
    company_entries.append(entry)
    ledger[company_name] = company_entries
    save_ledger(ledger)

    return {"entry": entry, "history": company_entries}


def calculate_circularity_rating(total_transactions: int, total_co2_saved: float) -> str:
    if total_transactions >= 20 and total_co2_saved >= 5000:
        return "Platinum"
    elif total_transactions >= 10 and total_co2_saved >= 2000:
        return "Gold"
    elif total_transactions >= 5:
        return "Silver"
    else:
        return "Emerging"


def aggregate_company_esg(history: list) -> dict:
    total_co2 = round(sum(e["co2_saved_kg"] for e in history), 2)
    total_landfill = round(sum(e["landfill_diverted_kg"] for e in history), 2)
    total_transactions = len(history)
    rating = calculate_circularity_rating(total_transactions, total_co2)

    material_breakdown = {}
    for e in history:
        material_breakdown[e["material_type"]] = material_breakdown.get(e["material_type"], 0) + e["quantity_kg"]

    return {
        "total_transactions": total_transactions,
        "total_co2_saved_kg": total_co2,
        "total_landfill_diverted_kg": total_landfill,
        "circularity_rating": rating,
        "material_breakdown": material_breakdown,
    }