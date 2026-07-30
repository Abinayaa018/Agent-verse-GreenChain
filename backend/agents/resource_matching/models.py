"""Message schemas for the Resource Matching agent."""

from pydantic import BaseModel, Field
from typing import Optional


class SourceLocation(BaseModel):
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    region: Optional[str] = None


class WasteProfile(BaseModel):
    material_name: str
    material_category: str
    physical_form: str
    composition: Optional[dict[str, float]] = None
    purity_pct: Optional[float] = None
    quantity_value: float
    quantity_unit: str
    frequency: str
    hazard_class: str
    source_location: SourceLocation = Field(default_factory=SourceLocation)
    max_transport_distance_km: Optional[float] = None
    current_disposal_method: Optional[str] = None
    current_disposal_cost_per_unit: Optional[float] = None
    exclusions: list[str] = Field(default_factory=list)
    notes: Optional[str] = None


class IndustryMatch(BaseModel):
    material_keyword: str
    industry_name: str
    industry_code: str
    reuse_pathway: str
    example_companies: list[str] = Field(default_factory=list)
    estimated_value_per_unit: Optional[float] = None
    typical_value_note: str = ""
    risk_or_caveat: Optional[str] = None
    sources: list[str] = Field(default_factory=list)
    grounded: bool = False
    demand_signal: float = 5.0
    confidence: float = 5.0


class ScoreBreakdown(BaseModel):
    technical_fit: float = 0.0
    logistics_cost: float = 0.0
    regulatory_ease: float = 0.0
    economic_value: float = 0.0
    demand_signal: float = 0.0
    confidence: float = 1.0
    weighted_total: float = 0.0


class ValidationFlag(BaseModel):
    code: str
    message: str
    severity: str  # "warning" | "error"


class MatchResult(BaseModel):
    match: IndustryMatch
    score: ScoreBreakdown
    validation_flags: list[ValidationFlag] = Field(default_factory=list)
    pitch_summary: Optional[str] = None


class ResourceMatchRequest(BaseModel):
    """uAgents message: inbound request to the resource matching agent."""
    profile: WasteProfile


class ResourceMatchResponse(BaseModel):
    """uAgents message: ranked match results returned by the agent."""
    results: list[MatchResult]
    material_name: str
    total_found: int
