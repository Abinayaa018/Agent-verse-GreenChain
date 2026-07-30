import os
import logging
from datetime import datetime
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score
from sklearn.model_selection import train_test_split
from .models import WastePredictionRequest, WastePredictionResponse

logger = logging.getLogger("waste_prediction.rules")

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(AGENT_DIR, "dataset")
MODEL_DIR = os.path.join(AGENT_DIR, "trained_models")

os.makedirs(DATASET_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

CSV_PATH = os.path.join(DATASET_DIR, "company_waste_history.csv")
MODEL_PATH = os.path.join(MODEL_DIR, "random_forest_waste_model.joblib")

INDUSTRIES = ["textiles", "packaging", "electronics", "agriculture", "construction", "manufacturing"]
SEASONS = ["spring", "summer", "monsoon", "winter"]

class WastePredictionEngine:
    """Intelligent engine that predicts corporate waste production via Random Forest regression."""

    def __init__(self):
        self.generate_dataset_if_missing()
        self.train_model_if_missing()

    def generate_dataset_if_missing(self):
        if os.path.exists(CSV_PATH):
            return

        logger.info("Generating synthetic corporate waste history CSV...")
        np.random.seed(42)

        companies = ["Tiruppur Textiles", "EcoFibre Ltd", "Electro-Recycle", "Kovai Paper Mills", "Chennai Polymers", "Salem Steel"]
        
        records = []
        for _ in range(6000):
            company = np.random.choice(companies)
            # Map company to matching main industry
            if company in ["Tiruppur Textiles", "EcoFibre Ltd"]:
                industry = "textiles"
            elif company == "Electro-Recycle":
                industry = "electronics"
            elif company == "Kovai Paper Mills":
                industry = "packaging"
            elif company == "Chennai Polymers":
                industry = "packaging"
            else:
                industry = "manufacturing"

            month = np.random.randint(1, 13)
            season = SEASONS[month % 4]
            production_volume = float(np.random.uniform(100.0, 2000.0))
            employees = int(np.random.randint(10, 500))
            working_days = int(np.random.randint(20, 27))
            
            # generated waste baseline (highly correlated with production volume and employees)
            prev_waste = float(production_volume * 1.5 + employees * 2.0 + np.random.normal(0, 50))
            prev_waste = max(10.0, prev_waste)

            season_factor = 1.2 if season == "summer" else 0.85 if season == "winter" else 1.0
            generated_waste = float(prev_waste * season_factor + np.random.normal(0, 30))
            generated_waste = round(max(10.0, generated_waste), 2)

            records.append({
                "company": company,
                "industry": industry,
                "month": month,
                "production_volume": round(production_volume, 2),
                "employees": employees,
                "working_days": working_days,
                "previous_waste": round(prev_waste, 2),
                "season": season,
                "generated_waste": generated_waste
            })

        df = pd.DataFrame(records)
        df.to_csv(CSV_PATH, index=False)
        logger.info(f"Corporate waste history saved at {CSV_PATH} with {len(df)} rows.")

    def train_model_if_missing(self):
        if os.path.exists(MODEL_PATH):
            return

        logger.info("Training Waste Prediction Random Forest Regressor model...")
        df = pd.read_csv(CSV_PATH)

        # Encodes category columns manually
        df["industry_idx"] = df["industry"].apply(lambda x: INDUSTRIES.index(x) if x in INDUSTRIES else -1)
        df["season_idx"] = df["season"].apply(lambda x: SEASONS.index(x) if x in SEASONS else -1)

        # Features
        feature_cols = ["production_volume", "employees", "working_days", "previous_waste", "month", "industry_idx", "season_idx"]
        X = df[feature_cols]
        y = df["generated_waste"]

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)

        model = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
        model.fit(X_train, y_train)

        # Validate
        preds = model.predict(X_test)
        r2 = r2_score(y_test, preds)
        logger.info(f"Model validation R2 score: {r2:.4f}")

        # Store model metadata
        meta = {
            "model": model,
            "r2_score": float(r2),
            "feature_cols": feature_cols
        }
        joblib.dump(meta, MODEL_PATH)
        logger.info(f"Saved trained Random Forest model successfully at {MODEL_PATH}")

    def predict_future_waste(self, company: str, industry: str, production_volume: float) -> dict:
        self.train_model_if_missing() # Safe check

        try:
            meta = joblib.load(MODEL_PATH)
            model = meta["model"]
            r2 = meta["r2_score"]
        except Exception as e:
            logger.error(f"Failed to load RF model: {e}. Fallback to heuristics.")
            return self._fallback_prediction(production_volume)

        # Extract averages for this company from history to fill missing inputs
        df = pd.read_csv(CSV_PATH)
        comp_df = df[df["company"].str.lower() == company.lower().strip()]
        
        if len(comp_df) > 0:
            avg_employees = int(comp_df["employees"].mean())
            avg_working_days = int(comp_df["working_days"].mean())
            avg_prev_waste = float(comp_df["generated_waste"].mean())
        else:
            # Fallback to global defaults
            avg_employees = 120
            avg_working_days = 24
            avg_prev_waste = production_volume * 1.6

        # Set month & season relative to current time
        current_month = datetime.now().month
        current_season = SEASONS[current_month % 4]
        
        industry_idx = INDUSTRIES.index(industry.lower().strip()) if industry.lower().strip() in INDUSTRIES else 0
        season_idx = SEASONS.index(current_season)

        # Predict current
        input_data = pd.DataFrame([{
            "production_volume": production_volume,
            "employees": avg_employees,
            "working_days": avg_working_days,
            "previous_waste": avg_prev_waste,
            "month": current_month,
            "industry_idx": industry_idx,
            "season_idx": season_idx
        }])
        
        predicted_waste = float(model.predict(input_data)[0])

        # Predict next month (month + 1, season index shift)
        next_month = (current_month % 12) + 1
        next_season_idx = SEASONS.index(SEASONS[next_month % 4])
        input_next = pd.DataFrame([{
            "production_volume": production_volume,
            "employees": avg_employees,
            "working_days": avg_working_days,
            "previous_waste": predicted_waste,
            "month": next_month,
            "industry_idx": industry_idx,
            "season_idx": next_season_idx
        }])
        next_month_prediction = float(model.predict(input_next)[0])

        # Calculate category distribution (mock allocations based on industry profile)
        ind_lower = industry.lower().strip()
        if ind_lower == "electronics":
            allocations = {"metal": 0.4, "plastic": 0.3, "hazardous": 0.2, "other": 0.1}
        elif ind_lower == "textiles":
            allocations = {"textile": 0.65, "plastic": 0.15, "paper": 0.1, "other": 0.1}
        elif ind_lower == "packaging":
            allocations = {"paper": 0.5, "plastic": 0.4, "other": 0.1}
        elif ind_lower == "agriculture":
            allocations = {"organic": 0.7, "plastic": 0.2, "other": 0.1}
        else:
            allocations = {"plastic": 0.3, "metal": 0.3, "paper": 0.2, "other": 0.2}

        categories = {cat: round(predicted_waste * pct, 2) for cat, pct in allocations.items()}

        return {
            "predicted_waste": round(predicted_waste, 2),
            "waste_categories": categories,
            "next_month_prediction": round(next_month_prediction, 2),
            "confidence": round(r2, 2)
        }

    def _fallback_prediction(self, volume: float) -> dict:
        predicted = volume * 1.8
        return {
            "predicted_waste": round(predicted, 2),
            "waste_categories": {"plastic": predicted * 0.4, "metal": predicted * 0.4, "other": predicted * 0.2},
            "next_month_prediction": round(predicted * 1.05, 2),
            "confidence": 0.75
        }
