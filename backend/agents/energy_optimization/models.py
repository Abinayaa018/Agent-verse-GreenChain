from pydantic import BaseModel, Field
from typing import List

class EnergyOptimizationResponse(BaseModel):
    energy_prediction: float = Field(..., description="Projected energy consumption in kWh")
    recommended_schedule: str = Field(..., description="Optimized operations scheduling advisory")
    energy_saving: float = Field(..., description="Projected energy savings in kWh")
    peak_hours: List[str] = Field(..., description="Identified regional high-rate peak hours list")
    cost_savings: float = Field(..., description="Calculated operating cost savings in INR")
