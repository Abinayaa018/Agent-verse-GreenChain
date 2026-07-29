"""Unique Pydantic data models for the GreenChain AI Circular Innovation Agent."""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict


class SourceLocation(BaseModel):
    """Geographic source location model."""
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    region: Optional[str] = None


class WasteProfileInput(BaseModel):
    """Input waste profile description requiring novel reuse pathway discovery."""
    material_name: str = Field(..., description="Name of the waste material, e.g., Spent Lithium Black Mass")
    material_category: str = Field(default="other", description="Category: organic, metal, plastic, chemical, e_waste, construction, glass, rubber, textile")
    physical_form: str = Field(default="solid", description="Form: solid, liquid, sludge, granulate, powder, gas, offcut")
    composition: Optional[Dict[str, float]] = Field(default=None, description="Chemical or elemental composition percentage")
    purity_pct: Optional[float] = Field(default=None, description="Purity percentage (0-100)")
    quantity_value: float = Field(default=100.0, description="Quantity numerical value")
    quantity_unit: str = Field(default="kg", description="Unit, e.g., kg, tonnes, litres")
    frequency: str = Field(default="monthly", description="one_off, weekly, monthly, continuous")
    hazard_class: str = Field(default="none", description="none, low, moderate, high, regulated")
    source_location: SourceLocation = Field(default_factory=SourceLocation)
    current_disposal_method: Optional[str] = Field(default=None, description="Landfill, Incineration, Storage, etc.")
    current_disposal_cost_per_unit: Optional[float] = Field(default=None, description="Current disposal cost per unit")
    notes: Optional[str] = Field(default=None, description="Additional technical constraints or notes")


class CircularInnovationRequest(BaseModel):
    """uAgents & HTTP inbound request model."""
    profile: WasteProfileInput
    max_recommendations: int = Field(default=5, ge=1, le=10, description="Top N recommendations to return")
    min_trl: Optional[int] = Field(default=1, ge=1, le=9, description="Minimum TRL filter")
    require_patent: bool = Field(default=False, description="Filter for solutions with supporting patents")


class ScientificPaperEvidence(BaseModel):
    """Supporting scientific research paper record."""
    title: str
    authors: List[str] = Field(default_factory=list)
    year: int
    doi_or_url: str
    citation_count: int = 0
    key_finding: str
    journal_or_publisher: Optional[str] = None


class PatentPriorArt(BaseModel):
    """Supporting patent record."""
    patent_number: str
    title: str
    assignee: str
    year: int
    url: str
    claim_summary: str
    patent_office: str = "WIPO/USPTO"


class CircularInnovationDiscovery(BaseModel):
    """Unique output model for Circular Innovation Discovery."""
    innovation_id: str = Field(..., description="Unique innovation tracking ID, e.g., INN-2026-EWASTE-001")
    target_industry: str = Field(..., description="Target application industry name")
    discovery_title: str = Field(..., description="Descriptive title of the novel reuse pathway")
    transformation_pathway: str = Field(..., description="Specific transformation or chemical conversion process")
    technical_synthesis: str = Field(..., description="Detailed technical synthesis grounded in scientific evidence")
    trl_level: int = Field(..., ge=1, le=9, description="Technology Readiness Level scale 1-9")
    trl_stage_description: str = Field(..., description="Detailed TRL stage definition")
    innovation_score: float = Field(..., ge=0.0, le=100.0, description="Composite multi-criteria score 0-100")
    confidence_rating: float = Field(..., ge=0.0, le=100.0, description="Evidence confidence rating 0-100")
    novelty_index: str = Field(default="HIGH_NOVELTY", description="Novelty index classification")
    decarbonization_impact: str = Field(default="High Scope 3 CO2 Avoidance", description="Estimated CO2 reduction potential")
    supporting_literature: List[ScientificPaperEvidence] = Field(default_factory=list)
    supporting_patents: List[PatentPriorArt] = Field(default_factory=list)
    industrial_benefits: List[str] = Field(default_factory=list)
    environmental_benefits: List[str] = Field(default_factory=list)
    processing_requirements: List[str] = Field(default_factory=list)
    technical_limitations: List[str] = Field(default_factory=list)
    verifiable_sources: List[str] = Field(..., min_length=1, description="List of verifiable source URLs (at least 1 required)")


class CircularInnovationResponse(BaseModel):
    """Unique top-level output response schema for Circular Innovation Agent."""
    query_material: str
    material_category: str
    discovery_type: str = "UNMATCHED_CIRCULAR_REUSE_DISCOVERY"
    total_discoveries: int
    discoveries: List[CircularInnovationDiscovery]
    execution_timestamp: str
    cached: bool = False
    status: str = "success"
