from pydantic import BaseModel, Field
from typing import List

class ProcurementRequest(BaseModel):
    required_material: str = Field(..., description="The material needed for factory production (e.g. plastic scraps, copper wire)")
    industry: str = Field(..., description="Target business industry")
    budget: float = Field(..., description="Procurement unit budget cap in INR per kg")
    quality: str = Field(..., description="Material grade: Grade A, Grade B, Grade C")

class ProcurementResponse(BaseModel):
    recommended_suppliers: List[str] = Field(..., description="Ecological suppliers matching quality & price")
    alternative_materials: List[str] = Field(..., description="Biodegradable or secondary waste alternates")
    cost_reduction_suggestions: List[str] = Field(..., description="Action tips to lower purchase budgets")
    sustainability_improvements: List[str] = Field(..., description="Carbon footprint optimization directives")
    advisory_brief: str = Field(..., description="Procurement executive logic summary brief")
