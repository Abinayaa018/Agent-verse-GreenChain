import os
import logging
import pandas as pd
import numpy as np
from agents.audit.rules import load_ledger, aggregate_company_esg
from .models import ReputationResponse

logger = logging.getLogger("sustainability_reputation.rules")

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(AGENT_DIR, "dataset")

os.makedirs(DATASET_DIR, exist_ok=True)

CSV_PATH = os.path.join(DATASET_DIR, "company_reputation_index.csv")

class SustainabilityReputationEngine:
    """Intelligent reputation ranking aggregator mapping carbon ledgers to trust indexes."""

    def __init__(self):
        self.generate_dataset_if_missing()

    def generate_dataset_if_missing(self):
        if os.path.exists(CSV_PATH):
            return

        logger.info("Generating synthetic corporate reputation index CSV...")
        companies = ["Tiruppur Textiles", "EcoFibre Ltd", "Electro-Recycle", "Kovai Paper Mills", "Chennai Polymers", "Salem Steel"]
        
        records = []
        for idx, comp in enumerate(companies, 1):
            esg = float(np.random.uniform(70.0, 95.0))
            credits = float(np.random.randint(10, 500))
            compliance = float(np.random.uniform(85.0, 100.0))
            trust = float(np.random.uniform(7.5, 9.8))
            
            reputation = float(np.round((esg * 0.4) + (compliance * 0.4) + (trust * 10 * 0.2), 2))
            
            records.append({
                "company_name": comp,
                "esg_score": round(esg, 2),
                "carbon_credits": credits,
                "compliance_score": round(compliance, 2),
                "marketplace_trust": round(trust, 2),
                "reputation_idx": reputation,
                "industry_rank": idx
            })

        pd.DataFrame(records).to_csv(CSV_PATH, index=False)
        logger.info(f"Reputation index database saved successfully at {CSV_PATH}.")

    def get_reputation_profile(self, company_name: str) -> dict:
        self.generate_dataset_if_missing()

        # Load values
        df = pd.read_csv(CSV_PATH)
        row = df[df["company_name"] == company_name]
        
        if len(row) > 0:
            match = row.iloc[0]
            esg = float(match["esg_score"])
            compliance = float(match["compliance_score"])
            trust = float(match["marketplace_trust"])
            credits = float(match["carbon_credits"])
        else:
            esg = 80.0
            compliance = 90.0
            trust = 8.2
            credits = 45.0

        # Attempt to inject real-time audit ledger updates
        ledger = load_ledger()
        history = ledger.get(company_name, [])
        if len(history) > 0:
            agg = aggregate_company_esg(history)
            esg = float(np.clip(agg["total_transactions"] * 9.5, 60.0, 98.0))
            compliance = 95.0

        reputation_index = float(np.round((esg * 0.4) + (compliance * 0.4) + (trust * 10 * 0.2), 1))
        
        # Calculate rank dynamically
        industry_rank = max(1, 12 - int(reputation_index / 9))

        # Award Badges based on index thresholds
        badges = []
        if reputation_index >= 90.0:
            badges.extend(["Gold Circular Tier", "Zero Waste Champion", "Verified Trust Issuer"])
        elif reputation_index >= 75.0:
            badges.extend(["Certified Recycler", "Carbon Offsetter"])
        else:
            badges.extend(["Emerging Innovator"])

        profile_summary = f"{company_name} maintains a robust reputation rating of {reputation_index}/100, characterized by solid compliance records and active circular trades on the marketplace."

        # Action suggestions
        suggestions = []
        if esg < 85.0:
            suggestions.append("Perform a baseline energy audit to claim higher carbon token offsets.")
        if compliance < 95.0:
            suggestions.append("Verify smart contract digital signatures immediately upon transaction completion.")
        if trust < 8.5:
            suggestions.append("Increase response rates in negotiation rounds to boost marketplace buyer rating.")

        if not suggestions:
            suggestions.append("Reputation stands at peak levels. Standard audit parameters are clean.")

        return {
            "reputation_index": reputation_index,
            "industry_rank": industry_rank,
            "badges": badges,
            "public_profile_summary": profile_summary,
            "improvement_suggestions": suggestions
        }
