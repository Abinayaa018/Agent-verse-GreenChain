from pydantic import BaseModel, Field
from typing import List

class SupplierReliabilityResponse(BaseModel):
    reliability_score: float = Field(..., description="Calculated supplier reliability score (0.0 to 100.0)")
    predicted_risk: str = Field(..., description="Risk category: LOW, MEDIUM, HIGH")
    trust_level: str = Field(..., description="Trust rating grade: Platinum, Gold, Silver, Bronze")
    recommended_suppliers: List[str] = Field(..., description="List of recommended alternative suppliers")
    confidence: float = Field(..., description="XGBoost model validation accuracy confidence index")
