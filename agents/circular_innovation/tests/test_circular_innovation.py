"""Comprehensive test suite for the GreenChain AI Circular Innovation Agent."""

import pytest
from agents.circular_innovation.models import (
    WasteProfileInput,
    CircularInnovationRequest,
    CircularInnovationResponse,
    CircularInnovationDiscovery,
    ScientificPaperEvidence,
    PatentPriorArt,
)
from agents.circular_innovation.rules import (
    CircularInnovationEngine,
    CircularInnovationRules,
    VectorStoreManager,
    CircularKnowledgeGraph,
    TFCircularInnovationClassifier,
    IntelligenceRetriever,
    INNOVATION_DATASET,
)


@pytest.fixture
def battery_profile():
    return WasteProfileInput(
        material_name="Spent Lithium Battery Black Mass",
        material_category="e_waste",
        physical_form="powder",
        quantity_value=2500.0,
        quantity_unit="kg",
        frequency="monthly",
        hazard_class="regulated",
        notes="High cobalt, lithium, and nickel content requiring hydrometallurgical recycling."
    )


@pytest.fixture
def citrus_profile():
    return WasteProfileInput(
        material_name="Citrus Peel Residue",
        material_category="organic",
        physical_form="solid",
        quantity_value=1500.0,
        quantity_unit="kg",
        frequency="weekly",
        hazard_class="none",
        notes="High moisture organic peel with essential oil potential."
    )


# ── Dataset & Rules Tests ────────────────────────────────----------------─────

def test_dataset_and_rules():
    assert len(INNOVATION_DATASET) > 0
    rules = CircularInnovationRules()
    profile = WasteProfileInput(material_name="Citrus Peel", material_category="organic")
    response = rules.check_circular_innovation(profile)
    assert response.status == "success"
    assert response.total_discoveries > 0


# ── Intelligence Retriever ────────────────────────────────-------------------

def test_intelligence_retriever():
    retriever = IntelligenceRetriever()
    papers = retriever.search_literature("citrus peel", category="organic", use_api=False, limit=2)
    assert len(papers) > 0
    assert isinstance(papers[0], ScientificPaperEvidence)

    patents = retriever.search_patents("lithium battery black mass", category="e_waste", limit=2)
    assert len(patents) > 0
    assert isinstance(patents[0], PatentPriorArt)


# ── Knowledge Graph ────────────────────────────────----------------───────────

def test_knowledge_graph_pathways():
    kg = CircularKnowledgeGraph()
    pathways = kg.find_pathways("Citrus Peel")
    assert len(pathways) > 0
    assert "target_industry" in pathways[0]
    assert "process" in pathways[0]


# ── Vector Store Manager ────────────────────────────────----------------------

def test_vector_store_manager():
    vstore = VectorStoreManager()
    results = vstore.similarity_search("battery cathode recycling", k=1)
    assert len(results) == 1
    assert results[0][1] >= 0.0


# ── Neural Classifier ────────────────────────────────-------------------------

def test_neural_classifier(battery_profile):
    clf = TFCircularInnovationClassifier()
    prob = clf.predict(battery_profile)
    assert 0.0 <= prob <= 1.0


# ── End-to-End Discovery Pipeline ─────────────────────────────────────────────

def test_full_circular_innovation_pipeline(battery_profile):
    engine = CircularInnovationEngine(use_api_search=False)
    request = CircularInnovationRequest(profile=battery_profile, max_recommendations=3)
    response = engine.discover_innovations(request)

    assert response.status == "success"
    assert response.query_material == battery_profile.material_name
    assert response.discovery_type == "UNMATCHED_CIRCULAR_REUSE_DISCOVERY"
    assert len(response.discoveries) > 0

    top_disc = response.discoveries[0]
    assert isinstance(top_disc, CircularInnovationDiscovery)
    assert top_disc.innovation_id.startswith("INN-2026-")
    assert top_disc.target_industry != ""
    assert top_disc.discovery_title != ""
    assert top_disc.transformation_pathway != ""
    assert top_disc.technical_synthesis != ""
    assert 1 <= top_disc.trl_level <= 9
    assert 0.0 <= top_disc.innovation_score <= 100.0
    assert len(top_disc.verifiable_sources) >= 1
    assert len(top_disc.industrial_benefits) > 0
    assert len(top_disc.environmental_benefits) > 0
