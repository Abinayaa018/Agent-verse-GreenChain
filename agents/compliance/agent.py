"""Compliance Agent — rule engine + ML hybrid compliance checker."""

import os
import warnings

import joblib
import numpy as np

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
warnings.filterwarnings("ignore")

import tensorflow as tf  # noqa: E402
from uagents import Agent, Context

from .models import ComplianceCheckRequest, ComplianceCheckResponse
from .rules import check_compliance

# ---------------------------------------------------------------------------
# Artifact paths — resolved relative to this file so they work regardless
# of where the agent is launched from.
# ---------------------------------------------------------------------------
_BASE_DIR = os.path.dirname(__file__)
_MODEL_PATH = os.path.join(_BASE_DIR, "compliance_model.keras")
_ENCODERS_PATH = os.path.join(_BASE_DIR, "encoders.joblib")
_SCALER_PATH = os.path.join(_BASE_DIR, "scaler.joblib")

# ---------------------------------------------------------------------------
# Feature column order — must exactly match train_model.py
# ---------------------------------------------------------------------------
_CATEGORICAL_COLUMNS = [
    "material",
    "source_industry",
    "destination_industry",
    "hazard_level",
    "hazardous",
    "permit_required",
    "authorized_destination",
    "transport_authorized",
    "pollution_category",
    "required_documents",
]

_NUMERICAL_COLUMNS = [
    "quantity_tons",
    "purity",
    "transport_distance_km",
    "missing_documents",
    "compliance_score",
]

# ---------------------------------------------------------------------------
# Startup — load artifacts once, reuse across all requests
# ---------------------------------------------------------------------------
def _load_artifacts() -> tuple[tf.keras.Model, dict, object] | tuple[None, None, None]:
    """
    Loads the Keras model, encoders dict, and scaler from disk.
    Returns (None, None, None) if any artifact is missing so the agent
    can still fall back to rule-engine-only mode.
    """
    if not all(os.path.exists(p) for p in [_MODEL_PATH, _ENCODERS_PATH, _SCALER_PATH]):
        return None, None, None
    model = tf.keras.models.load_model(_MODEL_PATH)
    encoders = joblib.load(_ENCODERS_PATH)
    scaler = joblib.load(_SCALER_PATH)
    return model, encoders, scaler


_MODEL, _ENCODERS, _SCALER = _load_artifacts()

# ---------------------------------------------------------------------------
# Feature builder
# Converts a ComplianceCheckRequest into the 15-column numpy array the
# model expects.  Fields not present in the request use safe defaults that
# represent a neutral / unknown state seen during training.
# ---------------------------------------------------------------------------
_HAZARD_TO_PERMIT = {
    "low": "No",
    "medium": "Yes",
    "high": "Yes",
}

_HAZARD_TO_HAZARDOUS = {
    "low": "No",
    "medium": "No",
    "high": "Yes",
}

_CATEGORY_TO_POLLUTION = {
    "hazardous": "Hazardous",
    "electronic": "Hazardous",
    "organic": "Organic",
    "chemical": "Hazardous",
    "general": "Industrial",
}

_AUTHORIZED_DESTINATIONS = {
    "certified_facility",
    "recycling_center",
    "composting_site",
    "approved_treatment_plant",
}


def _encode_value(encoder, value: str) -> int:
    """
    Safely label-encodes a value. Falls back to 0 if the value was
    not seen during training (unseen label).
    """
    try:
        return int(encoder.transform([value])[0])
    except ValueError:
        return 0


def _build_feature_row(request: ComplianceCheckRequest) -> np.ndarray | None:
    """
    Returns a (1, 15) float32 array ready for model.predict(), or None
    if encoders/scaler are not loaded.
    """
    if _ENCODERS is None or _SCALER is None:
        return None

    hazard = request.hazard_level.lower()
    category = request.category.lower()
    destination = request.destination.lower()
    is_authorized = destination in _AUTHORIZED_DESTINATIONS

    # Map request fields to the CSV column values used during training
    raw = {
        # Categorical
        "material":               category,
        "source_industry":        "Unknown",
        "destination_industry":   destination,
        "hazard_level":           request.hazard_level.capitalize(),
        "hazardous":              _HAZARD_TO_HAZARDOUS.get(hazard, "No"),
        "permit_required":        _HAZARD_TO_PERMIT.get(hazard, "No"),
        "authorized_destination": "Yes" if is_authorized else "No",
        "transport_authorized":   "Yes" if request.transport_mode not in ["sea"] else "No",
        "pollution_category":     _CATEGORY_TO_POLLUTION.get(category, "Industrial"),
        "required_documents":     "Invoice",   # conservative default
        # Numerical
        "quantity_tons":          50.0,        # median-like neutral value
        "purity":                 85.0,
        "transport_distance_km":  150.0,
        "missing_documents":      0.0,
        "compliance_score":       85.0,
    }

    # Encode categoricals
    cat_values = [
        _encode_value(_ENCODERS[col], str(raw[col]))
        if col in _ENCODERS else 0
        for col in _CATEGORICAL_COLUMNS
    ]

    # Scale numericals
    num_raw = np.array([[raw[col] for col in _NUMERICAL_COLUMNS]], dtype=np.float32)
    num_scaled = _SCALER.transform(num_raw)[0].tolist()

    feature_vector = np.array([cat_values + num_scaled], dtype=np.float32)
    return feature_vector


def _predict_confidence(request: ComplianceCheckRequest) -> float:
    """
    Returns the ML model's probability that the request is compliant (0.0–1.0).
    Returns 0.5 (neutral) if the model is unavailable.
    """
    if _MODEL is None:
        return 0.5
    features = _build_feature_row(request)
    if features is None:
        return 0.5
    prob = float(_MODEL.predict(features, verbose=0).flatten()[0])
    return round(prob, 4)


# ---------------------------------------------------------------------------
# Hybrid decision logic
# ---------------------------------------------------------------------------
def _combine(
    rule_response: ComplianceCheckResponse,
    confidence: float,
) -> ComplianceCheckResponse:
    """
    Merges rule engine output with ML confidence.

    Hard rule:
        Any legal violation from the rule engine → status is always FAIL,
        confidence is overridden to reflect the violation severity.

    No violations:
        Status is driven by ML confidence threshold (>= 0.5 → PASS).
    """
    has_violations = len(rule_response.violations) > 0

    if has_violations:
        # Legal violation — rule engine wins unconditionally
        final_status = "FAIL"
        # Confidence reflects how far below compliant the request is
        adjusted_confidence = round(min(confidence, 1.0 - (rule_response.compliance_score / 100)), 4)
    else:
        # No violations — ML prediction drives the final call
        final_status = "PASS" if confidence >= 0.5 else "FAIL"
        adjusted_confidence = confidence

    return ComplianceCheckResponse(
        status=final_status,
        confidence=adjusted_confidence,
        compliance_score=rule_response.compliance_score,
        permit_required=rule_response.permit_required,
        required_documents=rule_response.required_documents,
        violations=rule_response.violations,
        recommendations=rule_response.recommendations,
    )


# ---------------------------------------------------------------------------
# Agent
# ---------------------------------------------------------------------------
class ComplianceAgent(Agent):
    """
    Hybrid compliance agent: rule engine + TensorFlow ML model.

    On startup:
        - compliance_model.keras is loaded into memory once
        - encoders.joblib and scaler.joblib are loaded once

    Per request:
        1. Rule engine runs all legal checks
        2. ML model predicts compliance confidence
        3. Results are combined — legal violations always override ML

    Team integration:
        Input  → ComplianceCheckRequest  (agents.compliance.models)
        Output → ComplianceCheckResponse (agents.compliance.models)
    """

    def __init__(self, name: str = "compliance", seed: str = None, endpoint: str = None):
        super().__init__(name=name, seed=seed, endpoint=endpoint)
        self._log_startup()
        self._register_handlers()

    def _log_startup(self) -> None:
        ml_status = "loaded" if _MODEL is not None else "NOT FOUND — rule-engine-only mode"
        print(f"[ComplianceAgent] ML model  : {ml_status}")
        print(f"[ComplianceAgent] Encoders  : {'loaded' if _ENCODERS is not None else 'NOT FOUND'}")
        print(f"[ComplianceAgent] Scaler    : {'loaded' if _SCALER is not None else 'NOT FOUND'}")

    def _register_handlers(self) -> None:

        @self.on_message(model=ComplianceCheckRequest)
        async def handle_compliance_request(
            ctx: Context, sender: str, msg: ComplianceCheckRequest
        ) -> None:
            ctx.logger.info(
                f"[ComplianceAgent] Request from {sender} "
                f"| id={msg.waste_profile_id} "
                f"| category={msg.category} "
                f"| hazard={msg.hazard_level}"
            )

            try:
                # Step 1 — rule engine
                rule_result = check_compliance(msg)

                # Step 2 — ML prediction
                confidence = _predict_confidence(msg)

                # Step 3 — combine
                response = _combine(rule_result, confidence)

                ctx.logger.info(
                    f"[ComplianceAgent] {msg.waste_profile_id} → "
                    f"status={response.status} | "
                    f"confidence={response.confidence} | "
                    f"score={response.compliance_score}"
                )

                await ctx.send(sender, response)

            except ValueError as e:
                ctx.logger.error(f"[ComplianceAgent] Validation error | {msg.waste_profile_id}: {e}")
                await ctx.send(sender, ComplianceCheckResponse(
                    status="FAIL",
                    confidence=0.0,
                    compliance_score=0.0,
                    permit_required=[],
                    required_documents=[],
                    violations=[f"Validation error: {str(e)}"],
                    recommendations=["Ensure request contains valid category, hazard_level, and destination."],
                ))

            except Exception as e:
                ctx.logger.error(f"[ComplianceAgent] Unexpected error | {msg.waste_profile_id}: {e}")
                await ctx.send(sender, ComplianceCheckResponse(
                    status="FAIL",
                    confidence=0.0,
                    compliance_score=0.0,
                    permit_required=[],
                    required_documents=[],
                    violations=[f"Internal error: {str(e)}"],
                    recommendations=["Contact the compliance team to investigate this waste profile."],
                ))


if __name__ == "__main__":
    agent = ComplianceAgent()
    agent.run()
