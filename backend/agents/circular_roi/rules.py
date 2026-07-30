import os
import logging
import pandas as pd
import numpy as np
from .models import ROIRequest, ROIResponse

logger = logging.getLogger("circular_roi.rules")

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(AGENT_DIR, "dataset")

os.makedirs(DATASET_DIR, exist_ok=True)

CSV_PATH = os.path.join(DATASET_DIR, "investment_roi_history.csv")

class CircularROIEngine:
    """Intelligent ROI projector executing Monte Carlo path evaluations and NPV/IRR models."""

    def __init__(self):
        self.generate_dataset_if_missing()

    def generate_dataset_if_missing(self):
        if os.path.exists(CSV_PATH):
            return

        logger.info("Generating synthetic circular ROI history CSV...")
        np.random.seed(42)

        records = []
        for _ in range(3500):
            inv = float(np.random.uniform(50000.0, 1000000.0))
            equip = float(np.random.uniform(20000.0, 500000.0))
            volume = float(np.random.uniform(1000.0, 50000.0))
            energy = float(np.random.uniform(200.0, 10000.0))

            total_cap = inv + equip
            annual_savings = (volume * 8.5) + (energy * 6.0)
            
            # Simple cash flow model
            roi = (annual_savings * 5.0 - total_cap) / total_cap * 100.0
            roi = float(np.clip(roi, -20.0, 150.0))

            npv = -total_cap
            for yr in range(1, 6):
                npv += annual_savings / (1.08 ** yr)
            
            irr = (annual_savings / total_cap) * 20.0 # simplified IRR
            irr = float(np.clip(irr, -5.0, 45.0))

            records.append({
                "investment": round(inv, 2),
                "equipment_cost": round(equip, 2),
                "recycling_volume_kg": round(volume, 2),
                "energy_savings_kwh": round(energy, 2),
                "roi": round(roi, 2),
                "npv": round(npv, 2),
                "irr": round(irr, 2)
            })

        pd.DataFrame(records).to_csv(CSV_PATH, index=False)
        logger.info(f"Investment ROI dataset saved at {CSV_PATH} with 3500 rows.")

    def calculate_project_roi(self, req: ROIRequest) -> dict:
        self.generate_dataset_if_missing()

        total_outlay = req.investment + req.equipment_cost

        # Labor cost = weekly hours * 52 * average labor rate (₹250/hr)
        labor_rate_inr = 250.0
        annual_labor_cost = req.labor_hours_per_week * 52 * labor_rate_inr

        # Savings factors
        # 1 kg material recycling saves ~₹12.0 in waste hauling/materials procurement
        material_savings = req.recycling_volume_kg * 12.0
        # 1 kWh energy saves ~₹8.0
        energy_savings = req.energy_savings_kwh * 8.0

        annual_savings = material_savings + energy_savings
        annual_cash_flow = annual_savings - annual_labor_cost

        # 1 kg recycling reduces ~1.2 kg CO2, 1 kWh energy reduces ~0.85 kg CO2
        carbon_savings = (req.recycling_volume_kg * 1.2) + (req.energy_savings_kwh * 0.85)

        # Monte Carlo Simulation
        np.random.seed(42)
        sim_iterations = 1000
        sim_npvs = []
        sim_irrs = []

        for _ in range(sim_iterations):
            # Introduce +/- 12% cash flow operational variance
            yearly_flows = []
            for yr in range(1, 6):
                var = np.random.uniform(0.85, 1.15)
                yearly_flows.append(annual_cash_flow * var)

            # NPV calculation at 8% discount rate
            npv_sim = -total_outlay
            for yr, flow in enumerate(yearly_flows, 1):
                npv_sim += flow / (1.08 ** yr)
            sim_npvs.append(npv_sim)

            # Numerical IRR solve approximation
            try:
                # IRR is rate r where: -total_outlay + sum(flow / (1+r)^t) = 0
                # Using standard geometric rate approximation
                avg_flow = np.mean(yearly_flows)
                ratio = avg_flow / total_outlay
                if ratio > 0:
                    r = (ratio * 100.0) - 8.0
                else:
                    r = -5.0
                sim_irrs.append(float(np.clip(r, -20.0, 100.0)))
            except:
                sim_irrs.append(0.0)

        # Average outcomes
        mean_npv = float(np.mean(sim_npvs))
        mean_irr = float(np.mean(sim_irrs))
        roi = float(np.clip((annual_cash_flow * 5.0 - total_outlay) / total_outlay * 100.0, -100.0, 500.0))

        if annual_cash_flow > 0:
            payback = float(np.round(total_outlay / annual_cash_flow, 2))
        else:
            payback = 99.0

        # Clip values to standard range
        return {
            "roi": round(roi, 1),
            "npv": round(mean_npv, 2),
            "irr": round(mean_irr, 1),
            "payback_period": payback if payback <= 15.0 else 99.0,
            "annual_savings": round(annual_savings, 2),
            "carbon_savings": round(carbon_savings, 1),
            "profit_increase": round(max(0.0, annual_cash_flow), 2)
        }
