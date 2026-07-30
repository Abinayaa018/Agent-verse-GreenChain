"""Regulation rule sets for compliance checking."""

import json
import os
from .models import ComplianceCheckRequest, ComplianceCheckResponse


def load_regulations() -> dict:
    """Load mock regulations from data file."""
    reg_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        "data",
        "regulations.json",
    )
    with open(reg_path, "r") as f:
        return json.load(f)


def check_compliance(request: ComplianceCheckRequest) -> ComplianceCheckResponse:
    """Check if a waste handling plan complies with regulations."""
    regulations = load_regulations()
    violations = []
    warnings = []
    applied = []

    for reg in regulations.get("regulations", []):
        if request.category.lower() in [c.lower() for c in reg.get("applies_to", [])]:
            applied.append(reg["id"])

            # Check hazard level restrictions
            if request.hazard_level in reg.get("restricted_hazard_levels", []):
                violations.append(
                    f"{reg['id']}: {reg['description']}"
                )

    # Determine if compliant
    is_compliant = len(violations) == 0

    # Required permits based on hazard level
    permit_map = {
        "low": [],
        "medium": ["standard_waste_permit"],
        "high": ["standard_waste_permit", "hazardous_material_license"],
    }

    return ComplianceCheckResponse(
        is_compliant=is_compliant,
        regulations_applied=applied,
        warnings=warnings,
        violations=violations,
        required_permits=permit_map.get(request.hazard_level, []),
    )

