from uagents import Model
from typing import Optional

class WasteInput(Model):
    material_description: str
    quantity_kg: float
    source_industry: str
    image_path: Optional[str] = None   # if using CV classification

class WasteProfile(Model):
    material_type: str
    purity_pct: float
    hazard_level: str
    reusable: bool