from pydantic import BaseModel, Field

class FacilityExpansionResponse(BaseModel):
    recommended_city: str = Field(..., description="The recommended city candidate for facility expansion")
    roi: float = Field(..., description="Projected Return on Investment percentage")
    expected_throughput: float = Field(..., description="Estimated annual waste recycling throughput (metric tons)")
    environmental_benefit: str = Field(..., description="Projected local land fill diversion environmental benefit summary")
