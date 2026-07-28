"""Pipeline tests for the resource matching agent."""

import pytest
from .models import WasteProfile, IndustryMatch, SourceLocation
from .agent import ResourceMatchingAgent
from .matcher import find_similar_materials, identify_compatible_industries, score_match, rank_matches
from .knowledge_base import KnowledgeBase
from .validator import RuleBasedValidator
from .persuasion import TemplatePersuasionEngine


@pytest.fixture
def citrus_profile():
    return WasteProfile(
        material_name="citrus peel",
        material_category="organic",
        physical_form="solid",
        quantity_value=500,
        quantity_unit="kg",
        frequency="weekly",
        hazard_class="none",
        source_location=SourceLocation(latitude=13.0827, longitude=80.2707, region="India"),
        current_disposal_cost_per_unit=0.05,
    )


@pytest.fixture
def food_waste_profile():
    return WasteProfile(
        material_name="food waste",
        material_category="organic",
        physical_form="sludge",
        quantity_value=1000,
        quantity_unit="kg",
        frequency="continuous",
        hazard_class="none",
        current_disposal_cost_per_unit=30.0,
    )


@pytest.fixture
def agent():
    return ResourceMatchingAgent()


# ── validate_input ────────────────────────────────────────────────────────────

def test_validate_input_passes(agent, citrus_profile):
    result = agent.validate_input(citrus_profile)
    assert result.material_name == "citrus peel"


def test_validate_input_bad_category(agent, citrus_profile):
    citrus_profile.material_category = "unknown_cat"
    with pytest.raises(ValueError, match="material_category"):
        agent.validate_input(citrus_profile)


def test_validate_input_bad_hazard(agent, citrus_profile):
    citrus_profile.hazard_class = "extreme"
    with pytest.raises(ValueError, match="hazard_class"):
        agent.validate_input(citrus_profile)


def test_validate_input_zero_quantity(agent, citrus_profile):
    citrus_profile.quantity_value = 0
    with pytest.raises(ValueError, match="quantity_value"):
        agent.validate_input(citrus_profile)


# ── KB lookup ─────────────────────────────────────────────────────────────────

def test_find_similar_materials_exact(food_waste_profile):
    kb = KnowledgeBase()
    results = find_similar_materials(food_waste_profile, kb)
    names = [r.industry_name for r in results]
    assert "Anaerobic Digestion / Biogas" in names
    assert "Composting Facilities" in names


def test_find_similar_materials_partial(citrus_profile):
    kb = KnowledgeBase()
    results = find_similar_materials(citrus_profile, kb)
    names = [r.industry_name for r in results]
    assert "Essential Oil Extraction" in names or "Pectin Manufacturing" in names


def test_identify_compatible_industries(citrus_profile):
    kb = KnowledgeBase()
    similar = find_similar_materials(citrus_profile, kb)
    all_candidates = identify_compatible_industries(citrus_profile, kb, existing=similar)
    industry_names = [c.industry_name for c in all_candidates]
    assert len(industry_names) == len(set(industry_names)), "Duplicates found"


# ── Scoring ───────────────────────────────────────────────────────────────────

def test_score_match_returns_result(food_waste_profile):
    kb = KnowledgeBase()
    candidates = find_similar_materials(food_waste_profile, kb)
    assert candidates
    result = score_match(food_waste_profile, candidates[0])
    assert 0.0 <= result.score.weighted_total <= 10.0


def test_score_match_high_hazard_lowers_regulatory_ease():
    profile = WasteProfile(
        material_name="used solvent",
        material_category="chemical",
        physical_form="liquid",
        quantity_value=100,
        quantity_unit="litres",
        frequency="monthly",
        hazard_class="high",
    )
    kb = KnowledgeBase()
    candidates = find_similar_materials(profile, kb)
    if candidates:
        result = score_match(profile, candidates[0])
        assert result.score.regulatory_ease == 2.0


# ── Ranking ───────────────────────────────────────────────────────────────────

def test_rank_matches_sorted_descending(food_waste_profile):
    kb = KnowledgeBase()
    candidates = find_similar_materials(food_waste_profile, kb)
    ranked = rank_matches(food_waste_profile, candidates)
    scores = [r.score.weighted_total for r in ranked]
    assert scores == sorted(scores, reverse=True)


def test_exclusions_filtered(food_waste_profile):
    food_waste_profile.exclusions = ["Composting Facilities"]
    agent = ResourceMatchingAgent()
    response = agent.run(food_waste_profile)
    names = [r.match.industry_name for r in response.results]
    assert "Composting Facilities" not in names


# ── Validation ────────────────────────────────────────────────────────────────

def test_rule_validator_grounded_no_sources():
    from .models import MatchResult, ScoreBreakdown
    match = IndustryMatch(
        material_keyword="test",
        industry_name="Test Industry",
        industry_code="NAICS 000000",
        reuse_pathway="Test pathway.",
        grounded=True,
        sources=[],
    )
    result = MatchResult(match=match, score=ScoreBreakdown())
    validator = RuleBasedValidator()
    validated = validator.validate(result)
    codes = [f.code for f in validated.validation_flags]
    assert "GROUNDED_NO_SOURCES" in codes


def test_rule_validator_clean_match_no_flags(food_waste_profile):
    kb = KnowledgeBase()
    candidates = find_similar_materials(food_waste_profile, kb)
    ranked = rank_matches(food_waste_profile, candidates)
    validator = RuleBasedValidator()
    validated = validator.validate_all(ranked)
    for r in validated:
        error_flags = [f for f in r.validation_flags if f.severity == "error"]
        assert not error_flags


# ── Persuasion ────────────────────────────────────────────────────────────────

def test_template_persuasion_sets_pitch(food_waste_profile):
    agent = ResourceMatchingAgent()
    response = agent.run(food_waste_profile)
    for r in response.results:
        assert r.pitch_summary is not None
        assert len(r.pitch_summary) > 10


# ── Full pipeline ─────────────────────────────────────────────────────────────

def test_full_pipeline_citrus(citrus_profile):
    agent = ResourceMatchingAgent()
    response = agent.run(citrus_profile)
    assert response.material_name == "citrus peel"
    assert response.total_found == len(response.results)
    assert response.total_found > 0


def test_full_pipeline_returns_ranked_with_pitches(food_waste_profile):
    agent = ResourceMatchingAgent()
    response = agent.run(food_waste_profile)
    scores = [r.score.weighted_total for r in response.results]
    assert scores == sorted(scores, reverse=True)
    assert all(r.pitch_summary for r in response.results)
