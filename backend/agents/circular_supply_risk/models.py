from pydantic import BaseModel, Field
from typing import List

class SupplyRiskRequest(BaseModel):
    material: str = Field(..., description="Recyclable material category")

class SupplyRiskResponse(BaseModel):
    supply_risk_index: float = Field(..., description="Calculated supply risk level index (0.0 to 10.0)")
    scarcity_score: float = Field(..., description="Calculated scarcity index score (0.0 to 10.0)")
    alternative_suppliers: List[str] = Field(..., description="List of suggested alternate suppliers")
    risk_timeline: List[float] = Field(..., description="Projected risk index levels for the next 6 months")
