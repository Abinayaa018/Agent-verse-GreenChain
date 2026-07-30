import os
import logging
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from dotenv import load_dotenv
import google.generativeai as genai
from .models import InvestmentRequest, InvestmentResponse

logger = logging.getLogger("circular_investment.rules")

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(AGENT_DIR, "dataset")
MODEL_DIR = os.path.join(AGENT_DIR, "trained_models")

os.makedirs(DATASET_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

CSV_PATH = os.path.join(DATASET_DIR, "equipment_investment_history.csv")
MODEL_PATH = os.path.join(MODEL_DIR, "investment_priority_model.joblib")

EQUIPMENT = [
    "AI Optical Sorter", "Automated Compactor Baler", 
    "High-Shear Pelletizer Extruder", "IoT Weighbridge Scales", 
    "Solar Decanter Centrifuge"
]
MATERIALS = ["plastic", "metal", "battery", "paper", "textile"]

# Load environment API keys
dotenv_path = os.path.join(AGENT_DIR, "..", "..", ".env")
load_dotenv(dotenv_path)

gemini_key = os.getenv("GEMINI_API_KEY")
if gemini_key:
    genai.configure(api_key=gemini_key)

class CircularInvestmentEngine:
    """Intelligent capital expenditure prioritization engine using Random Forest and Gemini."""

    def __init__(self):
        self.generate_dataset_if_missing()
        self.train_model_if_missing()

    def generate_dataset_if_missing(self):
        if os.path.exists(CSV_PATH):
            return

        logger.info("Generating synthetic investment history CSV...")
        np.random.seed(42)

        records = []
        for _ in range(3000):
            budget = float(np.random.uniform(50000.0, 800000.0))
            mat = np.random.choice(MATERIALS)
            
            eq = np.random.choice(EQUIPMENT)
            cost = float(np.round(budget * np.random.uniform(0.7, 0.95), 2))
            
            roi = float(np.round(np.random.uniform(12.0, 48.0), 2))
            priority = float(np.clip((roi / 10.0) + (budget / 200000.0) + np.random.normal(0, 0.6), 0.0, 10.0))

            records.append({
                "budget": round(budget, 2),
                "primary_material": mat,
                "equipment_name": eq,
                "cost": cost,
                "roi": roi,
                "priority_score": round(priority, 2)
            })

        pd.DataFrame(records).to_csv(CSV_PATH, index=False)
        logger.info(f"Investment history dataset saved at {CSV_PATH} with 3000 rows.")

    def train_model_if_missing(self):
        if os.path.exists(MODEL_PATH):
            return

        logger.info("Training Investment Priority RF models...")
        df = pd.read_csv(CSV_PATH)

        df["material_idx"] = df["primary_material"].apply(lambda x: MATERIALS.index(x) if x in MATERIALS else 0)

        X = df[["budget", "material_idx", "roi"]]
        y = df["priority_score"]

        rf = RandomForestRegressor(n_estimators=40, max_depth=5, random_state=42)
        rf.fit(X, y)

        joblib.dump(rf, MODEL_PATH)
        logger.info(f"Saved Circular Investment model successfully at {MODEL_PATH}")

    def get_investment_recommendation(self, req: InvestmentRequest) -> dict:
        self.train_model_if_missing()

        mat_clean = req.primary_material.lower().strip()
        mat_idx = MATERIALS.index(mat_clean) if mat_clean in MATERIALS else 0

        # Match equipment based on material stream
        if mat_clean == "plastic":
            equipment = "High-Shear Pelletizer Extruder"
            cost = req.budget_inr * 0.85
            roi = 32.5
            co2 = 8500.0
            eff = 24.0
        elif mat_clean == "metal":
            equipment = "Automated Compactor Baler"
            cost = req.budget_inr * 0.75
            roi = 28.0
            co2 = 6200.0
            eff = 18.5
        elif mat_clean == "battery":
            equipment = "AI Optical Sorter"
            cost = req.budget_inr * 0.90
            roi = 42.0
            co2 = 12000.0
            eff = 35.0
        else:
            equipment = "IoT Weighbridge Scales"
            cost = req.budget_inr * 0.60
            roi = 18.0
            co2 = 2400.0
            eff = 12.0

        try:
            model = joblib.load(MODEL_PATH)
            input_df = pd.DataFrame([{
                "budget": req.budget_inr,
                "material_idx": mat_idx,
                "roi": roi
            }])
            priority_score = float(np.clip(model.predict(input_df)[0], 0.0, 10.0))
        except Exception as e:
            logger.error(f"Priority model estimation failed: {e}")
            priority_score = 7.5

        # Query Gemini for an executive advisory brief
        brief_prompt = f"""
        You are the GreenChain AI Capital Investment Advisor.
        Formulate a capital expenditure recommendation brief for the company '{req.company_name}':
        Budget: ₹{req.budget_inr:,.2f} INR
        Waste Commodity: {req.primary_material}
        Recommended Asset: {equipment}
        Acquisition Cost: ₹{cost:,.2f} INR
        Est. ROI: {roi}%
        Efficiency Gain: {eff}%

        Summarize why this equipment purchase is the priority choice, how it mitigates material leakage, and calculate the net payback term.
        Keep it to 3 sentences, professional tone.
        """

        advisory_brief = ""
        if gemini_key:
            try:
                model = genai.GenerativeModel("gemini-1.5-flash")
                response = model.generate_content(brief_prompt)
                advisory_brief = response.text.strip()
            except Exception as e:
                logger.error(f"Gemini brief drafting failed: {e}")

        if not advisory_brief:
            advisory_brief = f"Investing in the {equipment} is highly recommended for {req.company_name} to optimize the processing of {req.primary_material} scrap. With an acquisition cost of ₹{cost:,.2f} INR, this asset promises a {roi}% return and an efficiency gain of {eff}%. This deployment will directly reduce manual sorting bottlenecks and cut transport emissions."

        return {
            "recommended_equipment": equipment,
            "investment_cost": cost,
            "projected_roi": roi,
            "co2_savings_kg": co2,
            "efficiency_gain": eff,
            "priority_score": round(priority_score, 1),
            "advisory_brief": advisory_brief
        }
