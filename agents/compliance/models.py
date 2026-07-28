"""Message schemas for the Compliance agent."""

from pydantic import BaseModel
from typing import Optional


class ComplianceCheckRequest(BaseModel):
    """
    Sent by the Waste Intelligence Agent (or any upstream agent).
    All fields map directly to what the compliance rules need.
    """
    waste_profile_id: str
    category: str           # e.g. "hazardous", "electronic", "organic"
    hazard_level: str       # "low" | "medium" | "high"
    destination: str        # e.g. "certified_facility", "landfill", "recycling_center"
    transport_mode: Optional[str] = None  # "road" | "rail" | "sea" | None


class ComplianceCheckResponse(BaseModel):
    """
    Returned to the orchestrator / requesting agent after compliance check.
    Covers every output field required by the Compliance Agent spec.
    """
    status: str                     # "PASS" | "FAIL"
    confidence: float               # ML model probability 0.0 – 1.0 (1.0 = fully compliant)
    compliance_score: float         # 0.0 – 100.0  (rule-engine score)
    permit_required: list[str]      # permits that must be obtained
    required_documents: list[str]   # documents that must accompany the waste
    violations: list[str]           # rules that were broken
    recommendations: list[str]      # actionable advice for the sender
