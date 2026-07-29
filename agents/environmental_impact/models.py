from uagents import Model

class ImpactInput(Model):
    material_type: str      # e.g. "plastic", "metal", "paper" — matches waste_intelligence output
    quantity_kg: float

class ImpactReport(Model):
    material_type: str
    quantity_kg: float
    co2_saved_kg: float
    landfill_diverted_kg: float
    circularity_score: float   # 0-100, simple composite score