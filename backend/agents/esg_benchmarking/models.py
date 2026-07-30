from pydantic import BaseModel, Field
from typing import List, Dict

class ESGBenchmarkResponse(BaseModel):
    industry_rank: int = Field(..., description="Company ranking within the target industry sector")
    state_rank: int = Field(..., description="Company ranking within the state region")
    national_rank: int = Field(..., description="Company ranking on the national level")
    industry_average: Dict[str, float] = Field(..., description="Average metrics of the industry sector")
    company_score: Dict[str, float] = Field(..., description="Actual calculated metrics of the target company")
    benchmark_gap: Dict[str, float] = Field(..., description="Comparison gaps between company and industry benchmark")
    recommendations: List[str] = Field(..., description="Actionable ESG improvement recommendations")
