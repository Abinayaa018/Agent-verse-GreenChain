from pydantic import BaseModel, Field
from typing import List, Dict, Any

class EmissionsResponse(BaseModel):
    alerts: List[str] = Field(..., description="Active sensor anomaly warnings list")
    trend: List[Dict[str, Any]] = Field(..., description="Aggregated emission levels trend timeline")
    emission_status: str = Field(..., description="Calculated status description: STABLE, VOLATILE, VIOLATING")
    recommendations: List[str] = Field(..., description="Actionable emissions control recommendations")
