import os
import logging
import pandas as pd
import numpy as np
from typing import List, Dict
from agents.audit.rules import load_ledger, aggregate_company_esg
from .models import ESGBenchmarkResponse

logger = logging.getLogger("esg_benchmarking.rules")

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(AGENT_DIR, "dataset")

os.makedirs(DATASET_DIR, exist_ok=True)

CSV_PATH = os.path.join(DATASET_DIR, "industry_esg.csv")

INDUSTRIES = ["textiles", "packaging", "electronics", "agriculture", "construction", "manufacturing"]
STATES = ["Tamil Nadu", "Karnataka", "Maharashtra", "Delhi", "Telangana"]

class ESGBenchmarkingEngine:
    """Intelligent ESG engine assessing sustainable metrics against national baselines."""

    def __init__(self):
        self.generate_dataset_if_missing()

    def generate_dataset_if_missing(self):
        if os.path.exists(CSV_PATH):
            return

        logger.info("Generating industry ESG benchmarks CSV...")
        np.random.seed(42)

        records = []
        for ind in INDUSTRIES:
            for state in STATES:
                # Industry/State specific CO2 and Recycling targets
                base_co2 = 5000.0 if ind == "manufacturing" else 2000.0 if ind == "textiles" else 1500.0
                national_avg_co2 = float(np.round(base_co2 + np.random.normal(0, base_co2 * 0.08), 2))

                national_avg_rec = float(np.round(np.random.uniform(65.0, 75.0), 2))
                state_avg_rec = float(np.round(national_avg_rec + np.random.uniform(-4.0, 6.0), 2))
                industry_avg_rec = float(np.round(national_avg_rec + np.random.uniform(-5.0, 5.0), 2))

                industry_avg_circ = float(np.round(np.random.uniform(55.0, 80.0), 2))
                avg_landfill_diversion = float(np.round(np.random.uniform(70.0, 92.0), 2))

                records.append({
                    "industry": ind,
                    "state": state,
                    "national_average_co2": national_avg_co2,
                    "national_average_recycling": national_avg_rec,
                    "state_average_recycling": state_avg_rec,
                    "industry_average_recycling": industry_avg_rec,
                    "industry_average_circularity": industry_avg_circ,
                    "average_landfill_diversion": avg_landfill_diversion
                })

        pd.DataFrame(records).to_csv(CSV_PATH, index=False)
        logger.info(f"Industry ESG benchmarks database saved at {CSV_PATH} with {len(records)} rows.")

    def benchmark_company(self, company_name: str) -> dict:
        self.generate_dataset_if_missing()

        # Load ESG registry
        ledger = load_ledger()
        history = ledger.get(company_name, [])

        # Map company to industry/state
        comp_lower = company_name.lower().strip()
        if "textile" in comp_lower or "fibre" in comp_lower:
            industry = "textiles"
            state = "Tamil Nadu"
        elif "recycle" in comp_lower or "electro" in comp_lower:
            industry = "electronics"
            state = "Karnataka"
        elif "paper" in comp_lower or "mill" in comp_lower or "polymer" in comp_lower:
            industry = "packaging"
            state = "Maharashtra"
        elif "steel" in comp_lower or "manufacturing" in comp_lower:
            industry = "manufacturing"
            state = "Maharashtra"
        else:
            industry = "textiles"
            state = "Tamil Nadu"

        # Load industry benchmarks
        df = pd.read_csv(CSV_PATH)
        row = df[(df["industry"] == industry) & (df["state"] == state)]
        if len(row) > 0:
            benchmark = row.iloc[0]
        else:
            benchmark = df.iloc[0]

        # Calculate or mock company performance metrics
        if len(history) > 0:
            agg = aggregate_company_esg(history)
            co2_saved = agg["total_co2_saved_kg"]
            landfill_div = agg["total_landfill_diverted_kg"]
            recycling_rate = float(np.clip((landfill_div / (landfill_div + 150)) * 100, 50.0, 98.0))
            circularity_index = float(np.clip(agg["total_transactions"] * 8.5, 40.0, 96.0))
        else:
            # Fallback mocks if the company has not completed any transactions yet
            co2_saved = 2450.0
            recycling_rate = 84.5
            circularity_index = 72.0
            landfill_div = 4800.0

        # Build averages dictionary
        ind_avg = {
            "recycling_rate": float(benchmark["industry_average_recycling"]),
            "circularity": float(benchmark["industry_average_circularity"]),
            "landfill_diversion": float(benchmark["average_landfill_diversion"])
        }

        comp_score = {
            "recycling_rate": round(recycling_rate, 1),
            "circularity": round(circularity_index, 1),
            "landfill_diversion": round((landfill_div / (landfill_div + 500)) * 100, 1) # percent diversion
        }

        # Benchmark Gaps
        gaps = {k: round(comp_score[k] - ind_avg[k], 1) for k in ind_avg}

        # Recommendations based on gaps
        recommendations = []
        if gaps["recycling_rate"] < 0:
            recommendations.append(f"Upgrade sorting conveyor equipment to close the {abs(gaps['recycling_rate'])}% recycling gap against regional averages.")
        else:
            recommendations.append("Recycling efficiency remains above industry baseline. Keep optimizing.")

        if gaps["circularity"] < 0:
            recommendations.append(f"Source 10% more secondary plastics to increase circularity index target ({abs(gaps['circularity'])}% gap).")
        else:
            recommendations.append("Circularity index leads standard market baselines.")

        if gaps["landfill_diversion"] < 0:
            recommendations.append(f"Reduce landfill leakage rates. Integrate biological organic compositing pathways.")

        # Determine ranks deterministically based on company score
        industry_rank = max(1, 15 - int(circularity_index / 8))
        state_rank = max(1, 45 - int(recycling_rate / 2))
        national_rank = max(1, 120 - int(co2_saved / 25))

        return {
            "industry_rank": industry_rank,
            "state_rank": state_rank,
            "national_rank": national_rank,
            "industry_average": ind_avg,
            "company_score": comp_score,
            "benchmark_gap": gaps,
            "recommendations": recommendations
        }
