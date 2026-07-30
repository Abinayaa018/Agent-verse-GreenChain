from pydantic import BaseModel, Field
from typing import List, Dict, Any

class PricingRecommendationResponse(BaseModel):
    """Outbound recommended pricing payload containing forecasts and trends."""
    material_type: str = Field(..., description="Target material type name")
    recommended_price_inr_per_kg: float = Field(..., description="Calculated optimal price per kg in INR")
    price_trend: str = Field(..., description="UPWARD, STABLE, or DOWNWARD price trajectory")
    demand_score: float = Field(..., description="Demand level indicator from 0.0 to 10.0")
    supply_score: float = Field(..., description="Supply level indicator from 0.0 to 10.0")
    future_prediction: List[Dict[str, Any]] = Field(..., description="List of month-by-month price predictions")
