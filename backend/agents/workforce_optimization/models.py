from pydantic import BaseModel, Field
from typing import List, Dict

class WorkforceResponse(BaseModel):
    staff_allocation: Dict[str, int] = Field(..., description="Optimized headcount per shifts allocation map")
    recommended_shifts: List[str] = Field(..., description="High priority staffing shifts actions list")
    productivity_forecast: float = Field(..., description="Projected worker productivity factor index (0.0 to 100.0)")
    idle_workforce: float = Field(..., description="Projected idle or under-allocated personnel headcount")
