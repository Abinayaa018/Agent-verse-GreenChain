from pydantic import BaseModel, Field
from typing import List

class SustainabilityAdvisorRequest(BaseModel):
    company_name: str = Field(..., description="Target business organization")

class SustainabilityAdvisorResponse(BaseModel):
    recommendations: List[str] = Field(..., description="Personalized AI advisor recommendations")
    priority_actions: List[str] = Field(..., description="Top prioritized execution steps")
    estimated_cost_savings: float = Field(..., description="Estimated cost savings in INR")
    estimated_co2_reduction: float = Field(..., description="Estimated CO2 reduction in kg")
    roadmap: List[str] = Field(..., description="Chronological carbon-reduction roadmap milestones")
    executive_summary: str = Field(..., description="Brief executive advisor advisory summary")
