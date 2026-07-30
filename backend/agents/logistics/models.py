from uagents import Model
from typing import Optional

class LogisticsInput(Model):
    material_type: str
    quantity_kg: float
    source_location: str
    destination_location: str
    distance_km: Optional[float] = None

class LogisticsPlan(Model):
    material_type: str
    quantity_kg: float
    distance_km: float
    transport_mode: str
    estimated_cost_inr: float
    estimated_co2_kg: float
    estimated_days: float