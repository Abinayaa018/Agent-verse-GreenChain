from .models import ImpactInput, ImpactReport

# Approximate CO2-saved-per-kg-recycled figures (kg CO2e per kg material)
# Sourced from general recycling/circular-economy emission factor references —
# treat as indicative for a hackathon demo, not audit-grade figures.
EMISSION_FACTORS = {
    "battery":    1.50,
    "biological": 0.25,
    "cardboard":  0.94,
    "clothes":    3.80,
    "glass":      0.31,
    "metal":      4.50,
    "paper":      0.94,
    "plastic":    1.80,
    "shoes":      3.80,
    "trash":      0.00,
}

# Simple circularity weighting — how reusable/valuable the reclaimed stream typically is
CIRCULARITY_WEIGHTS = {
    "battery":    60,
    "biological": 70,
    "cardboard":  85,
    "clothes":    55,
    "glass":      90,
    "metal":      95,
    "paper":      85,
    "plastic":    65,
    "shoes":      50,
    "trash":      5,
}


def calculate_impact(material_type: str, quantity_kg: float) -> ImpactReport:
    material = material_type.lower()

    co2_factor = EMISSION_FACTORS.get(material, 0.5)
    circularity = CIRCULARITY_WEIGHTS.get(material, 30)

    co2_saved = round(quantity_kg * co2_factor, 2)
    landfill_diverted = round(quantity_kg * 0.9, 2)  # assume 90% of matched waste is actually diverted

    return ImpactReport(
        material_type=material,
        quantity_kg=quantity_kg,
        co2_saved_kg=co2_saved,
        landfill_diverted_kg=landfill_diverted,
        circularity_score=circularity,
    )