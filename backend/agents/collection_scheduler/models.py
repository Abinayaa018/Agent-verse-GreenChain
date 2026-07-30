from pydantic import BaseModel, Field
from typing import List, Optional

class SchedulePickupRequest(BaseModel):
    material: str = Field(..., description="Type of material to collect")
    quantity: float = Field(..., description="Quantity of waste in kg")
    city: str = Field(..., description="Pickup city location")
    urgency: str = Field(..., description="Urgency coefficient: high, medium, low")
    company: Optional[str] = Field("Tiruppur Textiles", description="Ordering enterprise name")

class SchedulePickupResponse(BaseModel):
    pickup_time: str = Field(..., description="Optimized scheduled time for collection")
    driver: str = Field(..., description="Assigned driver name")
    vehicle: str = Field(..., description="Assigned vehicle model and registration")
    ETA: str = Field(..., description="Estimated Time of Arrival duration")
    optimized_route: List[str] = Field(..., description="Optimized list of transit waypoints")
    recycler: str = Field(..., description="Assigned receiving recycling facility")
