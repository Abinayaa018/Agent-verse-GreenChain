from pydantic import BaseModel, Field
from typing import List

class ReputationResponse(BaseModel):
    reputation_index: float = Field(..., description="Aggregated Sustainability Reputation Index rating (0.0 to 100.0)")
    industry_rank: int = Field(..., description="Circularity standing rank within sector")
    badges: List[str] = Field(..., description="Awarded public reputation badges list")
    public_profile_summary: str = Field(..., description="Brief corporate ESG brand summary")
    improvement_suggestions: List[str] = Field(..., description="Actionable reputation score improvement steps")
