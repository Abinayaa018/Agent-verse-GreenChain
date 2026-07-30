from pydantic import BaseModel, Field

class MaterialQualityRequest(BaseModel):
    material_type: str = Field(..., description="Recyclable material category")
    industry: str = Field(..., description="Sourcing industry sector")
    storage_days: int = Field(..., description="Days spent in warehouse storage")
    humidity: float = Field(..., description="Ambient storage humidity percentage")
    transport_distance: float = Field(..., description="Transport shipping distance in km")

class MaterialQualityResponse(BaseModel):
    quality_score: float = Field(..., description="Predicted quality score (0.0 to 10.0)")
    predicted_moisture: float = Field(..., description="Estimated moisture content percentage")
    predicted_contamination: float = Field(..., description="Estimated contamination level percentage")
    degradation_risk: str = Field(..., description="Degradation level (LOW, MEDIUM, HIGH)")
    resale_grade: str = Field(..., description="Market resale grade (Grade-A, Grade-B, Grade-C, Grade-D)")
    confidence: float = Field(..., description="Model confidence/accuracy index (0.0 to 1.0)")
