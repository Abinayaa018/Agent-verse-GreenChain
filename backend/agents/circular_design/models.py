from pydantic import BaseModel, Field
from typing import List

class CircularDesignRequest(BaseModel):
    product_type: str = Field(..., description="The name or type of the product (e.g., smartphone, packaging, shoes)")
    material_composition: str = Field(..., description="Chemical or physical material components of the product")
    industry: str = Field(..., description="Industry sector of the product")

class CircularDesignResponse(BaseModel):
    material_substitutions: List[str] = Field(..., description="Recommended environment-friendly material substitutions")
    repairability_guidelines: List[str] = Field(..., description="Action instructions to improve ease of repair")
    recyclability_rating: float = Field(..., description="Overall recyclability index rating from 0.0 to 100.0")
    design_improvements: List[str] = Field(..., description="Structural product redesign recommendations")
    reuse_opportunities: List[str] = Field(..., description="End-of-life reuse or upcycling pathways")
    executive_summary: str = Field(..., description="Brief corporate brand executive circularity statement")
