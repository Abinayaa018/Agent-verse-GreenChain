from pydantic import BaseModel, Field

class DemandForecastRequest(BaseModel):
    material: str = Field(..., description="The type of recyclable material (e.g. plastic, metal)")
    industry: str = Field(..., description="The sector demanding the material (e.g. packaging, automotive)")

class DemandForecastResponse(BaseModel):
    demand_score: float = Field(..., description="Calculated demand score index from 0.0 to 10.0")
    predicted_price: float = Field(..., description="Forecasted average unit price in INR per kg")
    next_month_demand: float = Field(..., description="Forecasted next month quantity demanded in tons")
    trend: str = Field(..., description="Demand trend trajectory: UPWARD, DOWNWARD, or STABLE")
    confidence: float = Field(..., description="Model validation accuracy score (0.0 to 1.0)")
    inventory_recommendation: str = Field(..., description="Actionable inventory recommendation advisory text")
