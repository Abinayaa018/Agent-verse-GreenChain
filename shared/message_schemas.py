from uagents import Model
from typing import Optional, List

class WasteProfile(Model):
    material_type: str
    purity_pct: float
    hazard_level: str
    reusable: bool
    quantity_kg: float
    source_industry: str

class MatchResult(Model):
    waste_profile: WasteProfile
    candidate_buyers: List[str]
    top_match: Optional[str] = None

class ComplianceResult(Model):
    compliant: bool
    flagged_issues: List[str] = []

class EconomicEstimate(Model):
    estimated_value_inr: float
    processing_cost_inr: float
    transport_cost_inr: float
    roi_pct: float