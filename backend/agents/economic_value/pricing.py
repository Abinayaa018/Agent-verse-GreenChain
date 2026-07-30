"""Business logic for economic valuation of waste materials."""

from .models import EconomicValueRequest, EconomicValueResponse

# ---------------------------------------------------------------------------
# Rate tables — all values in Indian Rupees (INR) per metric ton
# ---------------------------------------------------------------------------

# Base market price per ton (INR) by material
_MARKET_PRICES: dict[str, float] = {
    "copper":       3_50_000.0,
    "aluminum":      78_000.0,
    "steel":         23_000.0,
    "e_waste":       54_000.0,
    "pet":           26_000.0,
    "hdpe":          34_000.0,
    "cardboard":      6_200.0,
    "office_paper":   4_500.0,
    "glass":          2_500.0,
    "food_waste":       800.0,
    "mixed":          7_500.0,
}

# Processing cost per ton (INR) by material
_PROCESSING_COSTS: dict[str, float] = {
    "copper":       15_000.0,
    "aluminum":     10_000.0,
    "steel":         7_500.0,
    "e_waste":      18_000.0,
    "pet":           6_500.0,
    "hdpe":          7_000.0,
    "cardboard":     3_200.0,
    "office_paper":  2_800.0,
    "glass":         3_700.0,
    "food_waste":    5_000.0,
    "mixed":         5_800.0,
}

# Transport cost per km per ton (INR)
_TRANSPORT_COST_PER_KM: float = 10.0

# Purity threshold below which a quality penalty is applied
_PURITY_PENALTY_THRESHOLD: float = 70.0
_PURITY_PENALTY_FACTOR: float = 0.80   # 20 % price reduction for low purity

# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _resolve_material(material: str) -> str:
    """Normalise material key; fall back to 'mixed' if unknown."""
    return material.strip().lower() if material.strip().lower() in _MARKET_PRICES else "mixed"


def _purity_multiplier(purity: float) -> float:
    return 1.0 if purity >= _PURITY_PENALTY_THRESHOLD else _PURITY_PENALTY_FACTOR


def _estimate_market_price(material_key: str, purity: float) -> float:
    """Return adjusted market price per ton based on material and purity."""
    base = _MARKET_PRICES[material_key]
    return round(base * _purity_multiplier(purity), 2)


def _estimate_processing_cost(material_key: str, quantity_tons: float) -> float:
    """Return total processing cost for the given quantity."""
    cost_per_ton = _PROCESSING_COSTS[material_key]
    return round(cost_per_ton * quantity_tons, 2)


def _estimate_transport_cost(distance_km: float, quantity_tons: float) -> float:
    """Return total transport cost: distance × rate × quantity."""
    return round(distance_km * _TRANSPORT_COST_PER_KM * quantity_tons, 2)


def _calculate_revenue(quantity_tons: float, market_price_per_ton: float) -> float:
    return round(quantity_tons * market_price_per_ton, 2)


def _calculate_total_cost(processing_cost: float, transport_cost: float) -> float:
    return round(processing_cost + transport_cost, 2)


def _calculate_net_profit(revenue: float, total_cost: float) -> float:
    return round(revenue - total_cost, 2)


def _calculate_roi(net_profit: float, total_cost: float) -> float:
    if total_cost == 0:
        return 0.0
    return round((net_profit / total_cost) * 100, 2)


def _classify_profitability(roi: float) -> str:
    if roi < 0:
        return "Loss"
    if roi < 15:
        return "Low Profit"
    if roi < 40:
        return "Moderate Profit"
    if roi < 80:
        return "High Profit"
    return "Excellent"


def _generate_recommendation(profitability: str) -> str:
    return {
        "Loss":            "Reject Transaction",
        "Low Profit":      "Search for Better Buyer",
        "Moderate Profit": "Proceed with Caution",
        "High Profit":     "Recommended",
        "Excellent":       "Highly Recommended",
    }[profitability]


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

def evaluate(request: EconomicValueRequest) -> EconomicValueResponse:
    """
    Run a full economic evaluation for an approved waste transaction.

    This is the only function agent.py needs to call.
    """
    material_key = _resolve_material(request.material)

    market_price_per_ton = _estimate_market_price(material_key, request.purity)
    processing_cost      = _estimate_processing_cost(material_key, request.quantity_tons)
    transport_cost       = _estimate_transport_cost(request.transport_distance_km, request.quantity_tons)
    revenue              = _calculate_revenue(request.quantity_tons, market_price_per_ton)
    total_cost           = _calculate_total_cost(processing_cost, transport_cost)
    net_profit           = _calculate_net_profit(revenue, total_cost)
    roi                  = _calculate_roi(net_profit, total_cost)
    profitability        = _classify_profitability(roi)
    recommendation       = _generate_recommendation(profitability)

    return EconomicValueResponse(
        waste_profile_id=request.waste_profile_id,
        market_price_per_ton=market_price_per_ton,
        processing_cost=processing_cost,
        transport_cost=transport_cost,
        revenue=revenue,
        total_cost=total_cost,
        net_profit=net_profit,
        roi_percent=roi,
        profitability=profitability,
        recommendation=recommendation,
    )

