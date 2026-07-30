from pydantic import BaseModel, Field
from typing import Dict

class WastePredictionRequest(BaseModel):
    company: str = Field(..., description="Target business company name")
    industry: str = Field(..., description="Target sector (e.g. textiles, packaging)")
    production_volume: float = Field(..., description="Estimated current monthly production volume metric")

class WastePredictionResponse(BaseModel):
    predicted_waste: float = Field(..., description="Predicted waste output in kg")
    waste_categories: Dict[str, float] = Field(..., description="Breakdown of waste by category (plastic, organic, hazardous, etc.) in kg")
    next_month_prediction: float = Field(..., description="Forecasted waste output for the subsequent month in kg")
    confidence: float = Field(..., description="Random Forest model validation R2/accuracy score")
