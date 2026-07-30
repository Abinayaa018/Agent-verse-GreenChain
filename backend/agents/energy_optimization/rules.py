import os
import logging
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor
from .models import EnergyOptimizationResponse

logger = logging.getLogger("energy_optimization.rules")

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(AGENT_DIR, "dataset")
MODEL_DIR = os.path.join(AGENT_DIR, "trained_models")

os.makedirs(DATASET_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

CSV_PATH = os.path.join(DATASET_DIR, "energy_consumption.csv")
MODEL_PATH = os.path.join(MODEL_DIR, "energy_model.joblib")

PLANTS = ["Tiruppur Weaving Plant", "Coimbatore Sorting Hub", "Chennai Extrusion Center", "Salem Compressed Scrap"]
EQUIPMENTS = ["Shredder Mill", "Pelletizer Extruder", "Hydraulic Baler", "Compactor Press"]
SEASONS = ["summer", "winter", "monsoon", "spring"]

class EnergyOptimizationEngine:
    """Intelligent plant energy load monitoring and schedule optimization engine using XGBoost."""

    def __init__(self):
        self.generate_dataset_if_missing()
        self.train_model_if_missing()

    def generate_dataset_if_missing(self):
        if os.path.exists(CSV_PATH):
            return

        logger.info("Generating synthetic energy consumption history CSV...")
        np.random.seed(42)

        records = []
        for _ in range(6000):
            plant = np.random.choice(PLANTS)
            eq = np.random.choice(EQUIPMENTS)
            hours = float(np.random.uniform(2.0, 24.0))
            prod = float(np.random.uniform(500.0, 10000.0))
            season = np.random.choice(SEASONS)
            temp = float(np.random.uniform(15.0, 42.0))

            # Power usage physics mock
            base_kw = 120.0 if eq == "Pelletizer Extruder" else 85.0 if eq == "Shredder Mill" else 45.0
            power_usage = float(np.round((base_kw * hours) + (prod * 0.015) + (temp * 0.4) + np.random.normal(0, 30.0), 2))

            records.append({
                "plant": plant,
                "equipment": eq,
                "power_usage": max(10.0, power_usage),
                "operating_hours": round(hours, 1),
                "production": round(prod, 1),
                "season": season,
                "temperature": round(temp, 1)
            })

        pd.DataFrame(records).to_csv(CSV_PATH, index=False)
        logger.info(f"Energy consumption dataset saved at {CSV_PATH} with 6000 rows.")

    def train_model_if_missing(self):
        if os.path.exists(MODEL_PATH):
            return

        logger.info("Training XGBoost Energy Regressor...")
        df = pd.read_csv(CSV_PATH)

        # Categorical map index
        df["plant_idx"] = df["plant"].apply(lambda x: PLANTS.index(x) if x in PLANTS else 0)
        df["eq_idx"] = df["equipment"].apply(lambda x: EQUIPMENTS.index(x) if x in EQUIPMENTS else 0)
        df["season_idx"] = df["season"].apply(lambda x: SEASONS.index(x) if x in SEASONS else 0)

        X = df[["plant_idx", "eq_idx", "operating_hours", "production", "season_idx", "temperature"]]
        y = df["power_usage"]

        xgb = XGBRegressor(n_estimators=50, max_depth=5, random_state=42)
        xgb.fit(X, y)

        joblib.dump(xgb, MODEL_PATH)
        logger.info(f"Saved energy load regressor successfully at {MODEL_PATH}")

    def get_energy_forecast(self, plant_name: str, equipment_name: str) -> dict:
        self.train_model_if_missing()

        # Clean strings
        p_clean = plant_name.strip()
        e_clean = equipment_name.strip()

        p_idx = PLANTS.index(p_clean) if p_clean in PLANTS else 0
        e_idx = EQUIPMENTS.index(e_clean) if e_clean in EQUIPMENTS else 0

        try:
            model = joblib.load(MODEL_PATH)
            # Predict for standard 8 hours run at 30°C temperature in summer
            input_df = pd.DataFrame([{
                "plant_idx": p_idx,
                "eq_idx": e_idx,
                "operating_hours": 8.0,
                "production": 5000.0,
                "season_idx": SEASONS.index("summer"),
                "temperature": 32.0
            }])
            power_pred = float(model.predict(input_df)[0])
        except Exception as e:
            logger.error(f"XGBoost energy load forecast failed: {e}")
            power_pred = 450.0

        # Calculate scheduling optimization recommendations
        peak_hours = ["18:00 - 22:00 (High Tariff)", "09:00 - 12:00 (Mid Peak)"]
        energy_savings = float(np.round(power_pred * 0.15, 1)) # shift load savings 15%
        cost_savings = float(np.round(energy_savings * 9.5, 2)) # tariff diff index (₹9.5 per kWh)

        sched = f"Shift heavy processing runs for '{e_clean}' to night slots (22:00 to 06:00) to cut load overhead."

        return {
            "energy_prediction": round(power_pred, 1),
            "recommended_schedule": sched,
            "energy_saving": energy_savings,
            "peak_hours": peak_hours,
            "cost_savings": cost_savings
        }
