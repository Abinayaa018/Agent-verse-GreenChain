import os
import logging
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor

logger = logging.getLogger("material_quality.rules")

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(AGENT_DIR, "dataset")
MODEL_DIR = os.path.join(AGENT_DIR, "trained_models")

os.makedirs(DATASET_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

CSV_PATH = os.path.join(DATASET_DIR, "material_quality_history.csv")

MATERIALS = ["plastic", "metal", "battery", "paper", "glass", "textile", "organic"]
INDUSTRIES = ["automotive", "packaging", "electronics", "textiles", "agriculture", "construction"]

class MaterialQualityEngine:
    """Intelligent engine comparing XGBoost and RF to predict commodity quality post-storage."""

    def __init__(self):
        self.generate_dataset_if_missing()
        self.train_models_if_missing()

    def generate_dataset_if_missing(self):
        if os.path.exists(CSV_PATH):
            return

        logger.info("Generating synthetic material quality history CSV...")
        np.random.seed(42)

        records = []
        for _ in range(6000):
            mat = np.random.choice(MATERIALS)
            ind = np.random.choice(INDUSTRIES)
            
            storage_days = int(np.random.randint(1, 45))
            humidity = float(np.random.uniform(20.0, 95.0))
            temperature = float(np.random.uniform(15.0, 42.0))
            transport_distance = float(np.random.uniform(5.0, 500.0))
            
            # Base quality metric
            prev_quality = float(np.random.uniform(7.0, 9.8))

            # Contamination and moisture calculation
            base_contamination = 2.0 if mat == "organic" else 15.0 if mat == "battery" else 5.0
            contamination = float(np.round(base_contamination + (transport_distance * 0.02) + np.random.normal(0, 2.0), 2))
            contamination = max(0.5, contamination)

            base_moisture = 40.0 if mat == "organic" else 12.0 if mat == "paper" else 3.0
            moisture = float(np.round(base_moisture + (humidity * 0.15) + (storage_days * 0.1) + np.random.normal(0, 1.5), 2))
            moisture = max(0.1, moisture)

            # Quality degradation score
            degradation = (storage_days * 0.04) + (moisture * 0.05) + (contamination * 0.12)
            quality_score = float(np.clip(prev_quality - degradation + np.random.normal(0, 0.4), 1.0, 10.0))

            records.append({
                "material_type": mat,
                "industry": ind,
                "storage_days": storage_days,
                "humidity": round(humidity, 2),
                "temperature": round(temperature, 2),
                "transport_distance": round(transport_distance, 2),
                "previous_quality": round(prev_quality, 2),
                "contamination_level": contamination,
                "moisture_content": moisture,
                "quality_score": round(quality_score, 2)
            })

        pd.DataFrame(records).to_csv(CSV_PATH, index=False)
        logger.info(f"Material quality dataset saved at {CSV_PATH} with 6000 rows.")

    def train_models_if_missing(self):
        targets = ["quality_score", "moisture_content", "contamination_level"]
        trained_flag = True
        
        for t in targets:
            if not os.path.exists(os.path.join(MODEL_DIR, f"{t}_model.joblib")):
                trained_flag = False
                break
        
        if trained_flag:
            return

        logger.info("Training Material Quality Prediction models...")
        df = pd.read_csv(CSV_PATH)

        # Categorical columns encoding
        df["material_idx"] = df["material_type"].apply(lambda x: MATERIALS.index(x) if x in MATERIALS else 0)
        df["industry_idx"] = df["industry"].apply(lambda x: INDUSTRIES.index(x) if x in INDUSTRIES else 0)

        feature_cols = ["material_idx", "industry_idx", "storage_days", "humidity", "transport_distance"]
        X = df[feature_cols]

        for t in targets:
            y = df[t]
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)

            # XGBoost Regressor
            xgb = XGBRegressor(n_estimators=60, max_depth=4, random_state=42)
            xgb.fit(X_train, y_train)
            xgb_mae = mean_absolute_error(y_test, xgb.predict(X_test))

            # Random Forest Regressor
            rf = RandomForestRegressor(n_estimators=60, max_depth=6, random_state=42)
            rf.fit(X_train, y_train)
            rf_mae = mean_absolute_error(y_test, rf.predict(X_test))

            # Choose the better model
            if xgb_mae < rf_mae:
                best_model = xgb
                best_mae = xgb_mae
                model_type = "xgboost"
            else:
                best_model = rf
                best_mae = rf_mae
                model_type = "random_forest"

            # Re-fit selected model on full dataset
            best_model.fit(X, y)

            # Compute R2 score/confidence proxy
            mean_y = y.mean()
            confidence = float(np.clip(1.0 - (best_mae / mean_y), 0.6, 0.98))

            meta = {
                "model": best_model,
                "model_type": model_type,
                "confidence": confidence,
                "feature_cols": feature_cols
            }
            joblib.dump(meta, os.path.join(MODEL_DIR, f"{t}_model.joblib"))
            logger.info(f"Target [{t}] model saved ({model_type}) with confidence {confidence:.2f}")

    def predict_material_quality(self, material_type: str, industry: str, storage_days: int, humidity: float, transport_distance: float) -> dict:
        self.train_models_if_missing()

        mat_clean = material_type.lower().strip()
        ind_clean = industry.lower().strip()

        mat_idx = MATERIALS.index(mat_clean) if mat_clean in MATERIALS else 0
        ind_idx = INDUSTRIES.index(ind_clean) if ind_clean in INDUSTRIES else 0

        input_df = pd.DataFrame([{
            "material_idx": mat_idx,
            "industry_idx": ind_idx,
            "storage_days": storage_days,
            "humidity": humidity,
            "transport_distance": transport_distance
        }])

        predictions = {}
        confidence_scores = []
        for t in ["quality_score", "moisture_content", "contamination_level"]:
            try:
                meta = joblib.load(os.path.join(MODEL_DIR, f"{t}_model.joblib"))
                model = meta["model"]
                predictions[t] = float(model.predict(input_df)[0])
                confidence_scores.append(meta["confidence"])
            except Exception as e:
                logger.error(f"Error loading model for {t}: {e}")
                # deterministic fallback
                predictions[t] = 7.5 if t == "quality_score" else 10.0

        quality_score = float(np.clip(predictions["quality_score"], 1.0, 10.0))
        moisture = float(predictions["moisture_content"])
        contamination = float(predictions["contamination_level"])
        confidence = float(np.mean(confidence_scores)) if len(confidence_scores) > 0 else 0.85

        # Classify outputs
        if storage_days > 20 or quality_score < 4.0:
            degradation_risk = "HIGH"
        elif storage_days > 8 or quality_score < 7.0:
            degradation_risk = "MEDIUM"
        else:
            degradation_risk = "LOW"

        if quality_score >= 8.5:
            resale_grade = "Grade-A"
        elif quality_score >= 6.5:
            resale_grade = "Grade-B"
        elif quality_score >= 4.5:
            resale_grade = "Grade-C"
        else:
            resale_grade = "Grade-D"

        return {
            "quality_score": round(quality_score, 1),
            "predicted_moisture": round(moisture, 1),
            "predicted_contamination": round(contamination, 1),
            "degradation_risk": degradation_risk,
            "resale_grade": resale_grade,
            "confidence": round(confidence, 2)
        }
