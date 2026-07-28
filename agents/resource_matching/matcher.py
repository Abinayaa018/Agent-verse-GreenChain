"""Deterministic matching and scoring — no LLM dependency."""

from .models import WasteProfile, IndustryMatch, ScoreBreakdown, MatchResult
from .knowledge_base import KnowledgeBase, _default_kb
from .utils import safe_ratio_score, hazard_penalty, purity_fit_score

_WEIGHTS = {
    "technical_fit":   0.25,
    "logistics_cost":  0.15,
    "regulatory_ease": 0.20,
    "economic_value":  0.20,
    "demand_signal":   0.20,
}


def find_similar_materials(
    profile: WasteProfile,
    kb: KnowledgeBase = _default_kb,
) -> list[IndustryMatch]:
    """Step 1 — retrieve KB entries similar to the material name."""
    return kb.find_similar_materials(profile.material_name)


def identify_compatible_industries(
    profile: WasteProfile,
    kb: KnowledgeBase = _default_kb,
    existing: list[IndustryMatch] | None = None,
) -> list[IndustryMatch]:
    """Step 2 — broaden with category-compatible entries, dedup against existing."""
    existing_names = {m.industry_name for m in (existing or [])}
    candidates = list(existing or [])
    seen = set(existing_names)

    for m in kb.identify_compatible_industries(profile.material_category):
        if m.industry_name not in seen:
            candidates.append(m)
            seen.add(m.industry_name)

    return candidates


def score_match(profile: WasteProfile, match: IndustryMatch) -> MatchResult:
    """Step 3 — score a single candidate against the waste profile."""
    technical_fit   = purity_fit_score(profile.purity_pct)
    regulatory_ease = hazard_penalty(profile.hazard_class)
    economic_value  = safe_ratio_score(match.estimated_value_per_unit, profile.current_disposal_cost_per_unit)
    logistics_cost  = 7.0 if profile.max_transport_distance_km else 5.0
    demand_signal   = match.demand_signal

    raw = (
        _WEIGHTS["technical_fit"]   * technical_fit
        + _WEIGHTS["logistics_cost"]  * logistics_cost
        + _WEIGHTS["regulatory_ease"] * regulatory_ease
        + _WEIGHTS["economic_value"]  * economic_value
        + _WEIGHTS["demand_signal"]   * demand_signal
    )
    confidence_multiplier = match.confidence / 10.0

    return MatchResult(
        match=match,
        score=ScoreBreakdown(
            technical_fit=round(technical_fit, 2),
            logistics_cost=round(logistics_cost, 2),
            regulatory_ease=round(regulatory_ease, 2),
            economic_value=round(economic_value, 2),
            demand_signal=round(demand_signal, 2),
            confidence=round(confidence_multiplier, 3),
            weighted_total=round(raw * confidence_multiplier, 4),
        ),
    )


def rank_matches(profile: WasteProfile, candidates: list[IndustryMatch]) -> list[MatchResult]:
    """Step 4 — score all candidates and return sorted by weighted_total descending."""
    return sorted(
        [score_match(profile, c) for c in candidates],
        key=lambda r: r.score.weighted_total,
        reverse=True,
    )
