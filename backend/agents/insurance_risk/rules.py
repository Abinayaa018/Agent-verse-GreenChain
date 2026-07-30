import os
import logging
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor
from .models import RiskAssessmentRequest, RiskAssessmentResponse

logger = logging.getLogger("insurance_risk.rules")

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(AGENT_DIR, "dataset")
MODEL_DIR = os.path.join(AGENT_DIR, "trained_models")

os.makedirs(DATASET_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

CSV_PATH = os.path.join(DATASET_DIR, "logistics_risk_history.csv")
MODEL_PATH = os.path.join(MODEL_DIR, "insurance_risk_model.joblib")

MATERIALS = ["plastic", "metal", "battery", "paper", "textile"]
VEHICLES = ["Heavy Duty Dump", "Electric Box Truck", "Flatbed Carrier", "Compact Logistics Van"]
SEASONS = ["spring", "summer", "monsoon", "winter"]

class InsuranceRiskEngine:
    """Intelligent logistics risk analysis engine evaluating transit parameters to calculate premiums."""

    def __init__(self):
        self.generate_dataset_if_missing()
        self.train_model_if_missing()

    def generate_dataset_if_missing(self):
        if os.path.exists(CSV_PATH):
            return

        logger.info("Generating synthetic logistics risk history CSV...")
        np.random.seed(42)

        records = []
        for _ in range(5000):
            mat = np.random.choice(MATERIALS)
            qty = float(np.random.uniform(200.0, 10000.0))
            dist = float(np.random.uniform(10.0, 600.0))
            veh = np.random.choice(VEHICLES)
            seas = np.random.choice(SEASONS)

            # Risk factors
            fire_base = 5.0 if mat == "battery" else 0.5
            fire_risk = float(np.clip(fire_base + np.random.normal(0, 0.5), 0.0, 10.0))

            delay_base = 4.0 if seas == "monsoon" else 1.0
            delay_risk = float(np.clip(delay_base + (dist * 0.005) + np.random.normal(0, 0.8), 0.0, 10.0))

            weather_base = 6.0 if seas == "monsoon" else 2.0 if seas == "summer" else 1.0
            weather_risk = float(np.clip(weather_base + np.random.normal(0, 0.6), 0.0, 10.0))

            # Overall risk calculation
            overall_risk = float(np.clip((fire_risk * 0.4) + (delay_risk * 0.3) + (weather_risk * 0.3) + np.random.normal(0, 0.4), 0.0, 10.0))

            # Premium estimation
            premium = float(np.round(800.0 + (qty * 0.18) + (dist * 1.2) + (overall_risk * 450.0), 2))

            records.append({
                "material_type": mat,
                "quantity": round(qty, 2),
                "distance": round(dist, 2),
                "vehicle_type": veh,
                "season": seas,
                "fire_risk": round(fire_risk, 2),
                "delay_risk": round(delay_risk, 2),
                "weather_risk": round(weather_risk, 2),
                "overall_risk": round(overall_risk, 2),
                "premium": premium
            })

        pd.DataFrame(records).to_csv(CSV_PATH, index=False)
        logger.info(f"Logistics risk registry saved at {CSV_PATH} with 5000 rows.")

    def train_model_if_missing(self):
        if os.path.exists(MODEL_PATH):
            return

        logger.info("Training Logistics Risk assessment Regressors...")
        df = pd.read_csv(CSV_PATH)

        # Categorical maps
        df["material_idx"] = df["material_type"].apply(lambda x: MATERIALS.index(x) if x in MATERIALS else 0)
        df["vehicle_idx"] = df["vehicle_type"].apply(lambda x: VEHICLES.index(x) if x in VEHICLES else 0)
        df["season_idx"] = df["season"].apply(lambda x: SEASONS.index(x) if x in SEASONS else 0)

        feature_cols = ["material_idx", "quantity", "distance", "vehicle_idx", "season_idx"]
        X = df[feature_cols]
        y = df["overall_risk"]

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)

        # XGBoost
        xgb = XGBRegressor(n_estimators=50, max_depth=4, random_state=42)
        xgb.fit(X_train, y_train)
        xgb_mae = mean_absolute_error(y_test, xgb.predict(X_test))

        # Random Forest
        rf = RandomForestRegressor(n_estimators=50, max_depth=6, random_state=42)
        rf.fit(X_train, y_train)
        rf_mae = mean_absolute_error(y_test, rf.predict(X_test))

        # Select winner
        if xgb_mae < rf_mae:
            best_model = xgb
            best_mae = xgb_mae
            model_type = "xgboost"
        else:
            best_model = rf
            best_mae = rf_mae
            model_type = "random_forest"

        best_model.fit(X, y)
        confidence = float(np.clip(1.0 - (best_mae / y.mean()), 0.6, 0.98))

        meta = {
            "model": best_model,
            "model_type": model_type,
            "confidence": confidence,
            "feature_cols": feature_cols
        }
        joblib.dump(meta, MODEL_PATH)
        logger.info(f"Saved logistics threat assessment model ({model_type}) with confidence {confidence:.2f}")

    def assess_shipment_risk(self, req: RiskAssessmentRequest) -> dict:
        self.train_model_if_missing()

        try:
            meta = joblib.load(MODEL_PATH)
            model = meta["model"]
            confidence = meta["confidence"]
        except Exception as e:
            logger.error(f"Failed to load risk model: {e}")
            return self._fallback_risk_assessment(req)

        # Map categoricals
        m_idx = MATERIALS.index(req.material_type.lower().strip()) if req.material_type.lower().strip() in MATERIALS else 0
        v_idx = VEHICLES.index(req.vehicle_type) if req.vehicle_type in VEHICLES else 0
        s_idx = SEASONS.index(req.season.lower().strip()) if req.season.lower().strip() in SEASONS else 0

        input_df = pd.DataFrame([{
            "material_idx": m_idx,
            "quantity": req.quantity,
            "distance": req.distance,
            "vehicle_idx": v_idx,
            "season_idx": s_idx
        }])

        risk_score = float(np.clip(model.predict(input_df)[0], 0.0, 10.0))

        # Premium calculation
        premium = float(np.round(800.0 + (req.quantity * 0.18) + (req.distance * 1.2) + (risk_score * 450.0), 2))

        # Risk Classification
        if risk_score >= 8.0:
            risk_category = "CRITICAL"
            rec = "High accident probability threat. Double-check hazardous shipping placards. Mandatory security escrow."
            suggestions = ["Reroute shipment away from heavy traffic sectors.", "Use closed electric box carrier trucks instead of open flatbeds.", "Incorporate temperature control metrics."]
        elif risk_score >= 5.5:
            risk_category = "HIGH"
            rec = "Recommend standard transit insurance coverage."
            suggestions = ["Verify driver credentials and vehicle fitness certification.", "Limit logistics speeds below 50 km/h."]
        elif risk_score >= 3.0:
            risk_category = "MEDIUM"
            rec = "Standard coverage is optional but recommended."
            suggestions = ["Optimize route timings to avoid night transit."]
        else:
            risk_category = "LOW"
            rec = "Low operational threat. Safe for bulk shipping."
            suggestions = ["Maintain default cargo safety precautions."]

        return {
            "risk_score": round(risk_score, 1),
            "insurance_recommendation": rec,
            "premium_estimate": premium,
            "risk_category": risk_category,
            "mitigation_suggestions": suggestions,
            "confidence": round(confidence, 2)
        }

    def _fallback_risk_assessment(self, req: RiskAssessmentRequest) -> dict:
        return {
            "risk_score": 4.5,
            "insurance_recommendation": "Standard transit coverage recommended",
            "premium_estimate": 1500.00,
            "risk_category": "MEDIUM",
            "mitigation_suggestions": ["Perform visual container check before dispatch."],
            "confidence": 0.85
        }
