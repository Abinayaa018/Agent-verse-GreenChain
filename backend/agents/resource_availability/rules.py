import os
import logging
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from .models import ResourceAvailabilityResponse

logger = logging.getLogger("resource_availability.rules")

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(AGENT_DIR, "dataset")
MODEL_DIR = os.path.join(AGENT_DIR, "trained_models")

os.makedirs(DATASET_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

CSV_PATH = os.path.join(DATASET_DIR, "regional_resources.csv")
MODEL_PATH = os.path.join(MODEL_DIR, "resource_model.joblib")

CITIES = ["Tiruppur", "Coimbatore", "Chennai", "Salem", "Erode"]
MATERIALS = ["plastic", "metal", "battery", "paper", "textile"]

class ResourceAvailabilityEngine:
    """Intelligent regional raw materials availability tracker using Random Forest Regressors."""

    def __init__(self):
        self.generate_dataset_if_missing()
        self.train_model_if_missing()

    def generate_dataset_if_missing(self):
        if os.path.exists(CSV_PATH):
            return

        logger.info("Generating synthetic regional resources database...")
        np.random.seed(42)

        records = []
        for _ in range(5000):
            city = np.random.choice(CITIES)
            mat = np.random.choice(MATERIALS)
            avail = float(np.random.uniform(50.0, 1200.0))
            cap = float(np.random.uniform(100.0, 1000.0))
            imports = float(np.random.uniform(10.0, 200.0))
            exports = float(np.random.uniform(5.0, 150.0))

            # Target future availability (next month) mock logic
            future_val = float(np.round(avail + imports - exports + np.random.normal(0, 45.0), 2))

            records.append({
                "city": city,
                "material": mat,
                "available_quantity": round(avail, 2),
                "processing_capacity": round(cap, 2),
                "imports": round(imports, 2),
                "exports": round(exports, 2),
                "future_availability": max(10.0, future_val)
            })

        pd.DataFrame(records).to_csv(CSV_PATH, index=False)
        logger.info(f"Regional resources saved successfully at {CSV_PATH} with 5000 rows.")

    def train_model_if_missing(self):
        if os.path.exists(MODEL_PATH):
            return

        logger.info("Training Random Forest Resource Regressor...")
        df = pd.read_csv(CSV_PATH)

        # Map indices
        df["city_idx"] = df["city"].apply(lambda x: CITIES.index(x) if x in CITIES else 0)
        df["mat_idx"] = df["material"].apply(lambda x: MATERIALS.index(x) if x in MATERIALS else 0)

        X = df[["city_idx", "mat_idx", "available_quantity", "processing_capacity", "imports", "exports"]]
        y = df["future_availability"]

        rf = RandomForestRegressor(n_estimators=35, random_state=42)
        rf.fit(X, y)

        joblib.dump(rf, MODEL_PATH)
        logger.info(f"Saved resource model successfully at {MODEL_PATH}")

    def get_regional_resource_availability(self, city_name: str, material_name: str) -> dict:
        self.train_model_if_missing()

        # Clean strings
        c_clean = city_name.strip()
        m_clean = material_name.strip().lower()

        df = pd.read_csv(CSV_PATH)
        match = df[(df["city"] == c_clean) & (df["material"] == m_clean)]

        if len(match) > 0:
            row = match.iloc[0]
            avail = float(row["available_quantity"])
            cap = float(row["processing_capacity"])
            imports = float(row["imports"])
            exports = float(row["exports"])
        else:
            avail = 350.0
            cap = 400.0
            imports = 45.0
            exports = 20.0

        try:
            model = joblib.load(MODEL_PATH)
            c_idx = CITIES.index(c_clean) if c_clean in CITIES else 0
            m_idx = MATERIALS.index(m_clean) if m_clean in MATERIALS else 0

            input_df = pd.DataFrame([{
                "city_idx": c_idx,
                "mat_idx": m_idx,
                "available_quantity": avail,
                "processing_capacity": cap,
                "imports": imports,
                "exports": exports
            }])
            future_pred = float(model.predict(input_df)[0])
        except Exception as e:
            logger.error(f"Random Forest resource forecast failed: {e}")
            future_pred = avail + 20.0

        # Shortage risk
        shortage = "CRITICAL" if avail < (cap * 0.7) else "LOW_RISK" if avail < cap else "STABLE"
        surplus = float(np.round(max(0.0, avail - cap), 1))

        return {
            "availability": round(avail, 1),
            "shortage_risk": shortage,
            "surplus": surplus,
            "future_availability": round(future_pred, 1)
        }
