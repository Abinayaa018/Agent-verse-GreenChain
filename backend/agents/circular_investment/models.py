from pydantic import BaseModel, Field

class InvestmentRequest(BaseModel):
    company_name: str = Field(..., description="Target company requesting investment advisory")
    budget_inr: float = Field(..., description="Target investment capital expenditure budget in INR")
    primary_material: str = Field(..., description="Primary waste commodity stream")

class InvestmentResponse(BaseModel):
    recommended_equipment: str = Field(..., description="Name of the recommended circular machinery asset")
    investment_cost: float = Field(..., description="Asset acquisition cost in INR")
    projected_roi: float = Field(..., description="Estimated ROI percentage over 3 years")
    co2_savings_kg: float = Field(..., description="Annual CO2 savings in kg")
    efficiency_gain: float = Field(..., description="Efficiency output gain percentage")
    priority_score: float = Field(..., description="Priority index scoring (0.0 to 10.0)")
    advisory_brief: str = Field(..., description="Gemini AI advisory description of the investment opportunity")
