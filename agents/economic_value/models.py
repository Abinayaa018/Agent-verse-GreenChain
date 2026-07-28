"""Message schemas for the Economic Value agent."""

from pydantic import BaseModel
from typing import Optional


class ValuationRequest(BaseModel):
    """Request to value a waste material."""
    material_type: str
    quantity_kg: float
    quality_grade: Optional[str] = "standard"
    location: Optional[str] = None
    market_conditions: Optional[dict] = None


class ValuationResponse(BaseModel):
    """Response with pricing information."""
    material_value_usd: float
    logistics_cost_estimate: float
    net_value_usd: float
    price_per_kg_usd: float
    currency: str = "USD"
    market_trend: str = "stable"


class PriceEstimate(BaseModel):
    """A single price estimate for a material."""
    material: str
    min_price_per_kg: float
    max_price_per_kg: float
    typical_price_per_kg: float

