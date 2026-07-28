"""Pricing and valuation logic for waste materials."""

from .models import ValuationRequest, ValuationResponse


# Base price per kg for common recyclable materials (USD)
BASE_MATERIAL_PRICES = {
    "PET": 0.35,
    "HDPE": 0.45,
    "aluminum": 0.85,
    "steel": 0.15,
    "copper": 3.50,
    "cardboard": 0.08,
    "office_paper": 0.06,
    "glass": 0.03,
    "food_waste": -0.05,  # cost to process
    "e_waste": 0.50,
    "mixed": 0.10,
}


def calculate_value(request: ValuationRequest) -> ValuationResponse:
    """Calculate the economic value of a waste material."""
    base_price = BASE_MATERIAL_PRICES.get(
        request.material_type, BASE_MATERIAL_PRICES["mixed"]
    )

    # Quality multiplier
    quality_multipliers = {
        "premium": 1.3,
        "standard": 1.0,
        "low": 0.7,
        "contaminated": 0.4,
    }
    quality_mult = quality_multipliers.get(request.quality_grade or "standard", 1.0)

    price_per_kg = base_price * quality_mult
    material_value = price_per_kg * request.quantity_kg

    # Logistics estimate (~15% of value)
    logistics_cost = material_value * 0.15

    return ValuationResponse(
        material_value_usd=round(material_value, 2),
        logistics_cost_estimate=round(logistics_cost, 2),
        net_value_usd=round(material_value - logistics_cost, 2),
        price_per_kg_usd=round(price_per_kg, 4),
        market_trend="stable",
    )

