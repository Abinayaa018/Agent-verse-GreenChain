import os
import logging
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from .models import WorkforceResponse

logger = logging.getLogger("workforce_optimization.rules")

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(AGENT_DIR, "dataset")
MODEL_DIR = os.path.join(AGENT_DIR, "trained_models")

os.makedirs(DATASET_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

CSV_PATH = os.path.join(DATASET_DIR, "employee_shift_data.csv")
MODEL_PATH = os.path.join(MODEL_DIR, "workforce_model.joblib")

PLANTS = ["Tiruppur Weaving Plant", "Coimbatore Sorting Hub", "Chennai Extrusion Center", "Salem Compressed Scrap"]
SHIFTS = ["Morning", "Afternoon", "Night"]

class WorkforceOptimizationEngine:
    """Intelligent workforce shift planner and productivity forecaster using Random Forest."""

    def __init__(self):
        self.generate_dataset_if_missing()
        self.train_model_if_missing()

    def generate_dataset_if_missing(self):
        if os.path.exists(CSV_PATH):
            return

        logger.info("Generating synthetic employee shift records CSV...")
        np.random.seed(42)

        records = []
        for _ in range(5000):
            plant = np.random.choice(PLANTS)
            workers = int(np.random.randint(10, 150))
            shift = np.random.choice(SHIFTS)
            attendance = float(np.random.uniform(0.7, 1.0))
            overtime = float(np.random.uniform(0.0, 10.0))
            downtime = float(np.random.uniform(0.0, 4.0))

            # Productivity physics mock
            prod = float(np.clip((attendance * 85.0) - (downtime * 5.0) + (overtime * 0.4) + np.random.normal(0, 5.0), 10.0, 100.0))

            records.append({
                "plant": plant,
                "workers": workers,
                "shift": shift,
                "attendance_rate": round(attendance, 2),
                "overtime_hours": round(overtime, 1),
                "downtime_hours": round(downtime, 1),
                "productivity": round(prod, 1)
            })

        pd.DataFrame(records).to_csv(CSV_PATH, index=False)
        logger.info(f"Employee shift dataset saved successfully at {CSV_PATH} with 5000 rows.")

    def train_model_if_missing(self):
        if os.path.exists(MODEL_PATH):
            return

        logger.info("Training Random Forest Workforce Regressor...")
        df = pd.read_csv(CSV_PATH)

        # Categoricals index maps
        df["plant_idx"] = df["plant"].apply(lambda x: PLANTS.index(x) if x in PLANTS else 0)
        df["shift_idx"] = df["shift"].apply(lambda x: SHIFTS.index(x) if x in SHIFTS else 0)

        X = df[["plant_idx", "workers", "shift_idx", "attendance_rate", "overtime_hours", "downtime_hours"]]
        y = df["productivity"]

        rf = RandomForestRegressor(n_estimators=30, random_state=42)
        rf.fit(X, y)

        joblib.dump(rf, MODEL_PATH)
        logger.info(f"Saved workforce model successfully at {MODEL_PATH}")

    def get_workforce_schedule(self, plant_name: str) -> dict:
        self.train_model_if_missing()

        # Clean string
        p_clean = plant_name.strip()
        p_idx = PLANTS.index(p_clean) if p_clean in PLANTS else 0

        # Run forecast across all three shifts
        try:
            model = joblib.load(MODEL_PATH)
            
            shift_productivities = []
            for s_idx, shift in enumerate(SHIFTS):
                # Predict under standard attendance 92% and 1 hour downtime
                input_df = pd.DataFrame([{
                    "plant_idx": p_idx,
                    "workers": 45,
                    "shift_idx": s_idx,
                    "attendance_rate": 0.92,
                    "overtime_hours": 2.0,
                    "downtime_hours": 0.5
                }])
                pred_prod = float(model.predict(input_df)[0])
                shift_productivities.append(pred_prod)
            
            mean_prod = float(np.mean(shift_productivities))
        except Exception as e:
            logger.error(f"Workforce RF forecast failed: {e}")
            mean_prod = 84.5

        # Build optimized allocations based on plant sizes
        allocation = {
            "Morning Shift": 65,
            "Afternoon Shift": 45,
            "Night Shift": 25
        }
        recommended_shifts = [
            "Increase headcount on Morning Shift to manage early waste arrivals.",
            "Schedule maintenance downtime to Night Shift slots."
        ]
        idle = float(np.round(max(2.0, 15.0 - (mean_prod * 0.1)), 1))

        return {
            "staff_allocation": allocation,
            "recommended_shifts": recommended_shifts,
            "productivity_forecast": round(mean_prod, 1),
            "idle_workforce": idle
        }
