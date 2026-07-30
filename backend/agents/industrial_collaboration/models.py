from pydantic import BaseModel, Field
from typing import List

class NodeItem(BaseModel):
    id: str = Field(..., description="Factory identifier name")
    role: str = Field(..., description="Entity synergy role: Supplier, Consumer, Processor")
    details: str = Field(..., description="Operation inputs and machinery details")

class LinkItem(BaseModel):
    source: str = Field(..., description="Origin node reference")
    target: str = Field(..., description="Target node reference")
    relation: str = Field(..., description="Material or machinery supply workflow description")

class OpportunityItem(BaseModel):
    title: str = Field(..., description="Partnership project title")
    savings: float = Field(..., description="Estimated cost savings in INR annually")
    details: str = Field(..., description="Advisory description of synergy collaboration")

class CollabResponse(BaseModel):
    nodes: List[NodeItem] = Field(..., description="Identified factory cluster nodes")
    links: List[LinkItem] = Field(..., description="Synergy link flows sequence")
    opportunities: List[OpportunityItem] = Field(..., description="Identified collaboration venture projects")
    expected_savings: float = Field(..., description="Total aggregated savings in INR")
