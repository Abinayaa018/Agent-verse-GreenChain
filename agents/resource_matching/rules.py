"""Regulation rule sets and matching pathways for resource matching."""

import json
import os
import logging
import numpy as np
import tensorflow as tf

from .models import (
    WasteProfile, IndustryMatch, ScoreBreakdown,
    ValidationFlag, MatchResult, ResourceMatchResponse
)

logger = logging.getLogger("resource_matching")

# Load mappings
MAPPINGS_PATH = os.path.join(
    os.path.dirname(__file__), "knowledge", "waste_industry_mappings.json"
)

CATEGORIES = [
    "organic", "metal", "plastic", "chemical", "textile",
    "construction", "e_waste", "paper_pulp", "glass", "rubber", "other"
]
HAZARDS = ["none", "low", "moderate", "high", "regulated"]
FORMS = ["solid", "liquid", "sludge", "granulate", "powder", "gas", "offcut"]


class TFResourceMatcher:
    """TensorFlow-based feedforward neural network for predicting reuse compatibility."""

    def __init__(self, mappings: list[dict]):
        self.mappings = mappings
        self.industries = sorted(list(set(m["industry_name"] for m in mappings)))
        self.model = None
        self._train_model()

    def _train_model(self):
        try:
            X = []
            y = []
            for entry in self.mappings:
                cat = entry.get("material_category", "other").lower()
                cat_idx = CATEGORIES.index(cat) if cat in CATEGORIES else CATEGORIES.index("other")
                
                haz = entry.get("hazard_class", "none").lower()
                haz_idx = HAZARDS.index(haz) if haz in HAZARDS else HAZARDS.index("none")
                
                purity = 0.8  # default typical purity
                form_idx = 0  # default solid
                
                X.append([cat_idx, haz_idx, purity, form_idx])
                
                ind_name = entry["industry_name"]
                y.append(self.industries.index(ind_name))
                
            X = np.array(X, dtype=np.float32)
            y = np.array(y, dtype=np.int32)
            
            # Simple Keras model for category classification
            model = tf.keras.Sequential([
                tf.keras.layers.Input(shape=(4,)),
                tf.keras.layers.Dense(16, activation='relu'),
                tf.keras.layers.Dense(len(self.industries), activation='softmax')
            ])
            model.compile(
                optimizer=tf.keras.optimizers.Adam(learning_rate=0.05),
                loss='sparse_categorical_crossentropy',
                metrics=['accuracy']
            )
            model.fit(X, y, epochs=50, verbose=0)
            self.model = model
            logger.info("TensorFlow resource matching classifier trained successfully.")
        except Exception as e:
            logger.error(f"Failed to train TensorFlow model: {e}")
            self.model = None

    def predict_compatibility(self, profile: WasteProfile) -> dict[str, float]:
        if not self.model:
            return {ind: 1.0 for ind in self.industries}
        try:
            cat = profile.material_category.lower()
            cat_idx = CATEGORIES.index(cat) if cat in CATEGORIES else CATEGORIES.index("other")
            
            haz = profile.hazard_class.lower()
            haz_idx = HAZARDS.index(haz) if haz in HAZARDS else HAZARDS.index("none")
            
            purity = (profile.purity_pct or 80.0) / 100.0
            
            form = profile.physical_form.lower()
            form_idx = FORMS.index(form) if form in FORMS else 0
            
            input_vec = np.array([[cat_idx, haz_idx, purity, form_idx]], dtype=np.float32)
            predictions = self.model.predict(input_vec, verbose=0)[0]
            
            return {self.industries[i]: float(predictions[i]) for i in range(len(self.industries))}
        except Exception as e:
            logger.error(f"Error during TF prediction: {e}")
            return {ind: 1.0 for ind in self.industries}


class KnowledgeBase:
    """KnowledgeBase containing all waste mappings and lookup logic."""

    def __init__(self):
        self._index: dict[str, list[IndustryMatch]] = {}
        self._category_index: dict[str, list[IndustryMatch]] = {}
        self.raw_mappings = []
        self._load()

    def _load(self) -> None:
        with open(MAPPINGS_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.raw_mappings = data["mappings"]
        for entry in self.raw_mappings:
            match = IndustryMatch(
                material_keyword=entry["material_keyword"],
                industry_name=entry["industry_name"],
                industry_code=entry["industry_code"],
                reuse_pathway=entry["reuse_pathway"],
                example_companies=entry.get("example_companies", []),
                estimated_value_per_unit=entry.get("estimated_value_per_unit"),
                typical_value_note=entry.get("typical_value_note", ""),
                risk_or_caveat=entry.get("risk_or_caveat"),
                sources=entry.get("sources", []),
                grounded=entry.get("grounded", False),
                demand_signal=entry.get("demand_signal", 5.0),
                confidence=entry.get("confidence", 5.0),
            )
            key = entry["material_keyword"].lower()
            self._index.setdefault(key, []).append(match)
            for cat in entry.get("compatible_categories", []):
                self._category_index.setdefault(cat.lower(), []).append(match)

    def find_similar_materials(self, material_name: str) -> list[IndustryMatch]:
        name_lower = material_name.lower()
        seen: set[str] = set()
        results: list[IndustryMatch] = []

        for keyword, entries in self._index.items():
            if keyword in name_lower or name_lower in keyword:
                for e in entries:
                    if e.industry_name not in seen:
                        results.append(e)
                        seen.add(e.industry_name)
        return results

    def identify_compatible_industries(self, material_category: str) -> list[IndustryMatch]:
        return list(self._category_index.get(material_category.lower(), []))

    def all_entries(self) -> list[IndustryMatch]:
        return [m for entries in self._index.values() for m in entries]


# Module level instances
_default_kb = KnowledgeBase()
_tf_matcher = TFResourceMatcher(_default_kb.raw_mappings)


def validate_input(profile: WasteProfile) -> WasteProfile:
    """Validate waste profile properties."""
    valid_categories = {
        "organic", "metal", "plastic", "chemical", "textile",
        "construction", "e_waste", "paper_pulp", "glass", "rubber", "other",
    }
    valid_forms = {"solid", "liquid", "sludge", "granulate", "powder", "gas", "offcut"}
    valid_frequencies = {"one_off", "weekly", "monthly", "continuous"}
    valid_hazards = {"none", "low", "moderate", "high", "regulated"}

    if profile.material_category not in valid_categories:
        raise ValueError(f"Invalid material_category: {profile.material_category}")
    if profile.physical_form not in valid_forms:
        raise ValueError(f"Invalid physical_form: {profile.physical_form}")
    if profile.frequency not in valid_frequencies:
        raise ValueError(f"Invalid frequency: {profile.frequency}")
    if profile.hazard_class not in valid_hazards:
        raise ValueError(f"Invalid hazard_class: {profile.hazard_class}")
    if profile.quantity_value <= 0:
        raise ValueError("quantity_value must be positive")
    return profile


def find_similar_materials(material_name: str, kb: KnowledgeBase = _default_kb) -> list[IndustryMatch]:
    return kb.find_similar_materials(material_name)


def identify_compatible_industries(
    profile: WasteProfile,
    kb: KnowledgeBase = _default_kb,
    existing: list[IndustryMatch] | None = None,
) -> list[IndustryMatch]:
    existing_names = {m.industry_name for m in (existing or [])}
    candidates = list(existing or [])
    seen = set(existing_names)

    for m in kb.identify_compatible_industries(profile.material_category):
        if m.industry_name not in seen:
            candidates.append(m)
            seen.add(m.industry_name)

    return candidates


def find_matches(material_name: str) -> list[IndustryMatch]:
    return _default_kb.find_similar_materials(material_name)


# Scoring helpers
def safe_ratio_score(value: float | None, disposal_cost: float | None, scale: float = 10.0) -> float:
    if not value or not disposal_cost:
        return 5.0
    return min((value / disposal_cost) / 3.0 * scale, scale)


def hazard_penalty(hazard_class: str) -> float:
    return {"none": 10.0, "low": 8.0, "moderate": 6.0, "high": 2.0, "regulated": 1.0}.get(hazard_class, 5.0)


def purity_fit_score(purity_pct: float | None) -> float:
    if purity_pct is None:
        return 5.0
    return min(purity_pct / 10.0, 10.0)


_WEIGHTS = {
    "technical_fit":   0.25,
    "logistics_cost":  0.15,
    "regulatory_ease": 0.20,
    "economic_value":  0.20,
    "demand_signal":   0.20,
}


def score_match(profile: WasteProfile, match: IndustryMatch, tf_predictions: dict[str, float] = None) -> MatchResult:
    """Score candidate industry match against profile features."""
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
    
    tf_probability = tf_predictions.get(match.industry_name, 0.5) if tf_predictions else 0.5
    confidence_multiplier = (match.confidence / 10.0) * (0.8 + 0.2 * tf_probability)

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


def rank_matches(profile: WasteProfile, candidates: list[IndustryMatch], tf_predictions: dict[str, float] = None) -> list[MatchResult]:
    return sorted(
        [score_match(profile, c, tf_predictions) for c in candidates],
        key=lambda r: r.score.weighted_total,
        reverse=True,
    )


# Rule-based validator
class RuleBasedValidator:
    def validate(self, result: MatchResult) -> MatchResult:
        flags: list[ValidationFlag] = list(result.validation_flags)
        m = result.match

        if m.grounded and not m.sources:
            flags.append(ValidationFlag(
                code="GROUNDED_NO_SOURCES",
                message="Match is marked grounded but has no source URLs.",
                severity="error",
            ))

        if m.estimated_value_per_unit is not None and m.estimated_value_per_unit > 10_000:
            flags.append(ValidationFlag(
                code="VALUE_OUTLIER",
                message=f"Estimated value {m.estimated_value_per_unit} is unusually high — verify.",
                severity="warning",
            ))

        if m.risk_or_caveat is None and result.score.regulatory_ease < 4.0:
            flags.append(ValidationFlag(
                code="MISSING_HAZARD_CAVEAT",
                message="Low regulatory ease score but no risk caveat provided.",
                severity="warning",
            ))

        if m.grounded and m.confidence < 3.0:
            flags.append(ValidationFlag(
                code="LOW_CONFIDENCE_GROUNDED",
                message="Grounded match has very low confidence — treat as unverified.",
                severity="warning",
            ))

        return result.model_copy(update={"validation_flags": flags})

    def validate_all(self, results: list[MatchResult]) -> list[MatchResult]:
        return [self.validate(r) for r in results]


# Persuasion Engine
class TemplatePersuasionEngine:
    def generate(self, result: MatchResult) -> MatchResult:
        m = result.match
        s = result.score

        value_clause = (
            f"at an estimated value of ${m.estimated_value_per_unit}/unit"
            if m.estimated_value_per_unit
            else "potentially offsetting disposal costs"
        )
        caveat_clause = f" Note: {m.risk_or_caveat}" if m.risk_or_caveat else ""
        flag_clause = (
            f" {len(result.validation_flags)} validation flag(s) require review."
            if result.validation_flags else ""
        )

        pitch = (
            f"{m.industry_name} can absorb your {m.material_keyword} via {m.reuse_pathway.rstrip('.')} "
            f"({value_clause}, match score {s.weighted_total:.2f}/10).{caveat_clause}{flag_clause}"
        )
        return result.model_copy(update={"pitch_summary": pitch})

    def generate_all(self, results: list[MatchResult]) -> list[MatchResult]:
        return [self.generate(r) for r in results]


def check_resource_matching(profile: WasteProfile) -> ResourceMatchResponse:
    """Analyze a waste profile and return ranked matches for compatible reuse pathways."""
    # 1. Validate inputs
    profile = validate_input(profile)

    # 2. Find similar materials
    similar = find_similar_materials(profile.material_name, _default_kb)

    # 3. Identify compatible industries
    candidates = identify_compatible_industries(profile, _default_kb, existing=similar)

    # 4. Predict compatibility via TensorFlow model
    tf_predictions = _tf_matcher.predict_compatibility(profile)

    # 5. Filter exclusions
    candidates = [c for c in candidates if c.industry_name not in profile.exclusions]

    # 6. Score & rank matches
    results = rank_matches(profile, candidates, tf_predictions)

    # 7. Rule validation
    validator = RuleBasedValidator()
    results = validator.validate_all(results)

    # 8. Generate persuasive pitches
    persuasion = TemplatePersuasionEngine()
    results = persuasion.generate_all(results)

    return ResourceMatchResponse(
        results=results,
        material_name=profile.material_name,
        total_found=len(results),
    )
