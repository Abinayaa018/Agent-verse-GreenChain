from pydantic import BaseModel, Field

class ROIRequest(BaseModel):
    investment: float = Field(..., description="Initial cash capital investment in INR")
    equipment_cost: float = Field(..., description="Purchase price of recycling machinery in INR")
    recycling_volume_kg: float = Field(..., description="Expected annual materials recycled in kg")
    labor_hours_per_week: float = Field(..., description="Operating hours input per week")
    energy_savings_kwh: float = Field(..., description="Projected energy conservation in kWh annually")

class ROIResponse(BaseModel):
    roi: float = Field(..., description="Calculated Return on Investment percentage")
    npv: float = Field(..., description="Calculated Net Present Value in INR over 5 years")
    irr: float = Field(..., description="Calculated Internal Rate of Return percentage")
    payback_period: float = Field(..., description="Investment Payback Period in years")
    annual_savings: float = Field(..., description="Estimated annual operational cost savings in INR")
    carbon_savings: float = Field(..., description="Estimated annual carbon reduction in kg CO2")
    profit_increase: float = Field(..., description="Estimated annual net profit bump in INR")
