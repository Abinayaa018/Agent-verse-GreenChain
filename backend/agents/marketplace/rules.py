import uuid
import json
import os
from .models import MarketplaceInput, TransactionRecord

TRUST_REVIEW_THRESHOLD = 50.0
REGISTRY_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "company_registry.json")


def load_registry() -> dict:
    if not os.path.exists(REGISTRY_PATH):
        return {}
    with open(REGISTRY_PATH, "r") as f:
        return json.load(f)


def save_registry(registry: dict):
    with open(REGISTRY_PATH, "w") as f:
        json.dump(registry, f, indent=2)


def get_or_create_company(registry: dict, company_name: str) -> dict:
    if company_name not in registry:
        registry[company_name] = {
            "completed_transactions": 0,
            "disputes": 0,
            "is_verified_business": False,
            "on_time_delivery_rate": 1.0,
        }
    return registry[company_name]


def calculate_trust_score(company: dict) -> float:
    base_score = 50.0
    history_bonus = min(company["completed_transactions"] * 2, 30)
    dispute_penalty = company["disputes"] * 10
    verification_bonus = 10 if company["is_verified_business"] else 0
    reliability_bonus = company["on_time_delivery_rate"] * 10 if company["completed_transactions"] > 0 else 0
    score = base_score + history_bonus - dispute_penalty + verification_bonus + reliability_bonus
    return round(max(0, min(score, 100)), 1)


def generate_contract_id() -> str:
    return f"GC-{uuid.uuid4().hex[:8].upper()}"


def evaluate_transaction(
    material_type: str, quantity_kg: float,
    seller_name: str, buyer_name: str, proposed_price_inr: float,
) -> TransactionRecord:
    registry = load_registry()

    seller = get_or_create_company(registry, seller_name)
    buyer = get_or_create_company(registry, buyer_name)

    seller_trust = calculate_trust_score(seller)
    buyer_trust = calculate_trust_score(buyer)
    combined_trust = round((seller_trust + buyer_trust) / 2, 1)

    contract_id = generate_contract_id()

    if combined_trust < TRUST_REVIEW_THRESHOLD:
        status = "pending_review"
        notes = f"Combined trust {combined_trust} below threshold — flagged for review."
    elif proposed_price_inr <= 0:
        status = "rejected"
        notes = "Invalid price."
    else:
        status = "confirmed"
        notes = f"Deal confirmed between {seller_name} (trust {seller_trust}) and {buyer_name} (trust {buyer_trust})."
        # ── THIS IS WHERE REPUTATION ACTUALLY BUILDS ──
        seller["completed_transactions"] += 1
        buyer["completed_transactions"] += 1

    save_registry(registry)  # persist the update so next time reflects new history

    return TransactionRecord(
        contract_id=contract_id,
        material_type=material_type.lower(),
        quantity_kg=quantity_kg,
        seller_name=seller_name,
        buyer_name=buyer_name,
        final_price_inr=proposed_price_inr,
        status=status,
        combined_trust_score=combined_trust,
        notes=notes,
    )