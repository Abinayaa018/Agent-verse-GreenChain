from pydantic import BaseModel, Field
from typing import List

class HazardClassificationRequest(BaseModel):
    material: str = Field(..., description="Chemical or material name")
    chemical_composition: str = Field(..., description="Details of chemical constituents")
    waste_description: str = Field(..., description="Physical status or source of the scrap run")
    msds_text: str = Field(..., description="Extracted MSDS hazard codes text")

class HazardClassificationResponse(BaseModel):
    hazard_category: str = Field(..., description="Assessed hazard grade: HAZARDOUS, NON-HAZARDOUS, TOXIC")
    handling_procedures: List[str] = Field(..., description="Steps for safe personnel contact")
    ppe: List[str] = Field(..., description="Recommended Personal Protective Equipment list")
    storage: str = Field(..., description="Storage vault temperature and isolation specifications")
    transport: str = Field(..., description="Safe shipment logistics requirements")
    disposal: str = Field(..., description="Circular neutralization or incineration requirements")
