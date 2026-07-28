"""Message schemas for the Economic Value agent."""

from pydantic import BaseModel


class EconomicValueRequest(BaseModel):
    """Received from the Compliance Agent after a transaction is approved."""
    waste_profile_id: str
    material: str
    source_industry: str
    destination_industry: str
    quantity_tons: float
    purity: float           # 0.0 – 100.0
    transport_distance_km: float


class EconomicValueResponse(BaseModel):
    """Full economic evaluation returned to the orchestrator."""
    waste_profile_id: str
    market_price_per_ton: float
    processing_cost: float
    transport_cost: float
    revenue: float
    total_cost: float
    net_profit: float
    roi_percent: float
    profitability: str      # Loss | Low Profit | Moderate Profit | High Profit | Excellent
    recommendation: str
