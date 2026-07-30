from pydantic import BaseModel, Field
from typing import List

class PolicyRequest(BaseModel):
    company_profile: str = Field(..., description="Details of the company size and main product line")
    industry: str = Field(..., description="Target business industry")
    location: str = Field(..., description="Operational city and state region")

class PolicyResponse(BaseModel):
    policy_summary: str = Field(..., description="Executive summary of the applicable state/national environmental policies")
    regulatory_risks: List[str] = Field(..., description="Identified legal risk violations and potential fine indicators")
    recommended_changes: List[str] = Field(..., description="Actionable corporate structural process revisions")
    government_incentives: List[str] = Field(..., description="Applicable recycling subsidies, tax breaks, or carbon grants")
    compliance_roadmap: List[str] = Field(..., description="Compliance timeline milestones roadmap")
