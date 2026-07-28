"""Regulation rule sets and compliance checking logic."""

from .models import ComplianceCheckRequest, ComplianceCheckResponse

# ---------------------------------------------------------------------------
# In-memory regulation data — replace with a DB or external source later.
# Each entry covers one waste category and defines what is restricted/required.
# ---------------------------------------------------------------------------
REGULATIONS: dict = {
    "hazardous": {
        "restricted_destinations": ["landfill", "open_dump"],
        "restricted_transport_modes": ["sea"],
        "required_permits": ["hazardous_waste_permit", "epa_manifest"],
        "required_documents": ["waste_manifest", "safety_data_sheet", "generator_id"],
        "high_hazard_permits": ["hazardous_material_license", "special_handling_permit"],
    },
    "electronic": {
        "restricted_destinations": ["landfill", "open_dump", "incineration"],
        "restricted_transport_modes": [],
        "required_permits": ["e_waste_permit"],
        "required_documents": ["e_waste_tracking_form", "recycler_certification"],
        "high_hazard_permits": ["extended_producer_responsibility_cert"],
    },
    "organic": {
        "restricted_destinations": ["open_dump"],
        "restricted_transport_modes": [],
        "required_permits": [],
        "required_documents": ["composting_approval"],
        "high_hazard_permits": [],
    },
    "chemical": {
        "restricted_destinations": ["landfill", "open_dump", "recycling_center"],
        "restricted_transport_modes": ["sea"],
        "required_permits": ["chemical_disposal_permit", "epa_manifest"],
        "required_documents": ["chemical_inventory_list", "safety_data_sheet", "spill_response_plan"],
        "high_hazard_permits": ["hazardous_material_license", "chemical_transport_cert"],
    },
    "general": {
        "restricted_destinations": ["open_dump"],
        "restricted_transport_modes": [],
        "required_permits": ["standard_waste_permit"],
        "required_documents": ["waste_transfer_note"],
        "high_hazard_permits": [],
    },
}

# Destinations that are always considered authorized regardless of category
AUTHORIZED_DESTINATIONS = {
    "certified_facility",
    "recycling_center",
    "composting_site",
    "approved_treatment_plant",
}

# Score penalties — each violation deducts from 100
PENALTY = {
    "hazardous_destination": 40,
    "unauthorized_destination": 35,
    "transport_violation": 25,
    "missing_document": 10,
}


# ---------------------------------------------------------------------------
# Modular rule functions
# ---------------------------------------------------------------------------

def check_hazardous_handling(request: ComplianceCheckRequest, rules: dict) -> list[str]:
    """
    Returns violations related to hazardous waste destination restrictions.
    Only applies when the waste category has restricted destinations defined.
    """
    violations = []
    restricted = rules.get("restricted_destinations", [])
    if request.destination.lower() in restricted:
        violations.append(
            f"Destination '{request.destination}' is prohibited for "
            f"'{request.category}' waste under hazardous handling rules."
        )
    return violations


def check_transport_permit(request: ComplianceCheckRequest, rules: dict) -> list[str]:
    """
    Returns violations when the chosen transport mode is restricted
    for the given waste category.
    """
    violations = []
    if not request.transport_mode:
        return violations
    restricted_modes = rules.get("restricted_transport_modes", [])
    if request.transport_mode.lower() in restricted_modes:
        violations.append(
            f"Transport mode '{request.transport_mode}' is not permitted for "
            f"'{request.category}' waste."
        )
    return violations


def check_destination_authorization(request: ComplianceCheckRequest) -> list[str]:
    """
    Returns a violation if the destination is not in the globally
    authorized destinations list.
    """
    violations = []
    if request.destination.lower() not in AUTHORIZED_DESTINATIONS:
        violations.append(
            f"Destination '{request.destination}' is not an authorized waste facility."
        )
    return violations


def check_required_documents(request: ComplianceCheckRequest, rules: dict) -> tuple[list[str], list[str]]:
    """
    Returns (required_documents, violations).
    Violations are raised when high-hazard waste is missing elevated documentation.
    Documents are always returned so the caller knows what to prepare.
    """
    base_docs = list(rules.get("required_documents", []))
    violations = []

    if request.hazard_level == "high":
        extra = ["emergency_response_plan", "hazard_assessment_report"]
        for doc in extra:
            if doc not in base_docs:
                base_docs.append(doc)
        violations.append(
            "High hazard level requires emergency_response_plan and hazard_assessment_report."
        )

    return base_docs, violations


def calculate_compliance_score(violations: list[str]) -> float:
    """
    Deducts penalty points per violation keyword found in violation messages.
    Score is clamped between 0.0 and 100.0.
    """
    score = 100.0
    for v in violations:
        if "prohibited" in v or "hazardous" in v.lower():
            score -= PENALTY["hazardous_destination"]
        elif "not an authorized" in v:
            score -= PENALTY["unauthorized_destination"]
        elif "transport mode" in v:
            score -= PENALTY["transport_violation"]
        elif "requires" in v:
            score -= PENALTY["missing_document"]
    return max(0.0, round(score, 1))


def build_permits(request: ComplianceCheckRequest, rules: dict) -> list[str]:
    """
    Assembles the full permit list based on category rules and hazard level.
    High hazard level adds elevated permits on top of the base set.
    """
    permits = list(rules.get("required_permits", []))
    if request.hazard_level == "high":
        for p in rules.get("high_hazard_permits", []):
            if p not in permits:
                permits.append(p)
    return permits


def build_recommendations(violations: list[str], request: ComplianceCheckRequest) -> list[str]:
    """
    Generates human-readable recommendations based on what violations were found.
    """
    recommendations = []
    if not violations:
        recommendations.append("No violations found. Ensure all required documents are prepared before transport.")
        return recommendations

    for v in violations:
        if "Destination" in v and "prohibited" in v:
            recommendations.append(
                f"Redirect waste from '{request.destination}' to a certified_facility or approved_treatment_plant."
            )
        if "not an authorized" in v:
            recommendations.append(
                "Verify the destination is registered as an authorized waste facility before proceeding."
            )
        if "transport mode" in v:
            recommendations.append(
                f"Switch transport mode from '{request.transport_mode}' to an approved alternative (e.g. road or rail)."
            )
        if "High hazard" in v:
            recommendations.append(
                "Prepare emergency_response_plan and hazard_assessment_report before submitting for approval."
            )

    return recommendations


# ---------------------------------------------------------------------------
# Main entry point — orchestrates all rule checks
# ---------------------------------------------------------------------------

def check_compliance(request: ComplianceCheckRequest) -> ComplianceCheckResponse:
    """
    Runs all compliance checks and returns a full ComplianceCheckResponse.
    This is the only function agent.py needs to call.
    """
    category_key = request.category.lower()
    rules = REGULATIONS.get(category_key, REGULATIONS["general"])

    violations: list[str] = []

    violations += check_hazardous_handling(request, rules)
    violations += check_transport_permit(request, rules)
    violations += check_destination_authorization(request)

    required_documents, doc_violations = check_required_documents(request, rules)
    violations += doc_violations

    score = calculate_compliance_score(violations)
    permits = build_permits(request, rules)
    recommendations = build_recommendations(violations, request)

    return ComplianceCheckResponse(
        status="PASS" if not violations else "FAIL",
        confidence=0.0,          # filled in by agent.py after ML prediction
        compliance_score=score,
        permit_required=permits,
        required_documents=required_documents,
        violations=violations,
        recommendations=recommendations,
    )
