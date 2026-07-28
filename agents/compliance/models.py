"""Message schemas for the Compliance agent."""

from pydantic import BaseModel
from typing import Optional


class ComplianceCheckRequest(BaseModel):
    """Request to check compliance for a waste handling plan."""
    waste_profile_id: str
    category: str
    hazard_level: str
    destination: str
    transport_mode: Optional[str] = None


class ComplianceCheckResponse(BaseModel):
    """Response with compliance status and details."""
    is_compliant: bool
    regulations_applied: list[str]
    warnings: list[str]
    violations: list[str]
    required_permits: list[str]


class Regulation(BaseModel):
    """A single regulation rule."""
    id: str
    jurisdiction: str
            description: str
    applies_to: list[str]
    requirements: list[str]

