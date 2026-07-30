from pydantic import BaseModel, Field
from typing import List

class RiskAssessmentRequest(BaseModel):
    material_type: str = Field(..., description="Waste material type category")
    quantity: float = Field(..., description="Shipment quantity in kg")
    distance: float = Field(..., description="Shipment transit distance in km")
    vehicle_type: str = Field(..., description="Carrier vehicle carrier type (e.g. Flatbed, Dump)")
    season: str = Field(..., description="Transit season: summer, winter, monsoon, spring")

class RiskAssessmentResponse(BaseModel):
    risk_score: float = Field(..., description="Predicted risk index score (0.0 to 10.0)")
    insurance_recommendation: str = Field(..., description="Actionable insurance coverage recommendation")
    premium_estimate: float = Field(..., description="Calculated transit insurance premium in INR")
    risk_category: str = Field(..., description="Assessed threat category (LOW, MEDIUM, HIGH, CRITICAL)")
    mitigation_suggestions: List[str] = Field(..., description="List of action safety recommendations")
