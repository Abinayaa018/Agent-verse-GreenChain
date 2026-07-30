from pydantic import BaseModel, Field
from typing import List

class AlternativeFacility(BaseModel):
    facility: str = Field(..., description="Name of the alternative recycler facility")
    available_capacity: float = Field(..., description="Available capacity in kg")
    processing_fee: float = Field(..., description="Processing fee in INR per kg")
    distance: float = Field(..., description="Distance to facility in km")

class RecyclingCapacityResponse(BaseModel):
    recommended_facility: str = Field(..., description="Top recommended recycling facility name")
    available_capacity: float = Field(..., description="Available daily capacity at recommended facility in kg")
    waiting_time: float = Field(..., description="Estimated processing waiting time in hours")
    distance: float = Field(..., description="Proximity distance in km")
    processing_fee: float = Field(..., description="Processing fee in INR per kg")
    confidence: float = Field(..., description="Match matching index score (0.0 to 1.0)")
    alternatives: List[AlternativeFacility] = Field(..., description="List of alternative compatible facilities")
