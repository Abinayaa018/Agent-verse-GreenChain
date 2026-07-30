from pydantic import BaseModel, Field

class ResourceAvailabilityResponse(BaseModel):
    availability: float = Field(..., description="Available quantity of materials locally (metric tons)")
    shortage_risk: str = Field(..., description="Calculated shortage threat category: STABLE, LOW_RISK, CRITICAL")
    surplus: float = Field(..., description="Local surplus over processing capacity (metric tons)")
    future_availability: float = Field(..., description="Predicted next month availability projection (metric tons)")
