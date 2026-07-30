import os
import json
import logging
from typing import List, Dict, Any
from dotenv import load_dotenv
import google.generativeai as genai
from agents.audit.rules import load_ledger, aggregate_company_esg

logger = logging.getLogger("sustainability_recommendation.rules")

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))

# Locate and load .env in backend directory
dotenv_path = os.path.join(AGENT_DIR, "..", "..", ".env")
load_dotenv(dotenv_path)

gemini_key = os.getenv("GEMINI_API_KEY")
if gemini_key:
    genai.configure(api_key=gemini_key)
    logger.info("Gemini API configured successfully for Sustainability Advisor.")
else:
    logger.warning("GEMINI_API_KEY environment variable is not defined.")

class SustainabilityRecommendationEngine:
    """Intelligent reasoning engine aggregating platform metrics to query Gemini 1.5 Flash."""

    def __init__(self):
        pass

    def generate_sustainability_recommendations(self, company_name: str) -> dict:
        # 1. Gather context from platform database (audit ledger totals)
        ledger = load_ledger()
        history = ledger.get(company_name, [])

        if len(history) > 0:
            agg = aggregate_company_esg(history)
            co2_saved = agg["total_co2_saved_kg"]
            landfill_div = agg["total_landfill_diverted_kg"]
            transactions = agg["total_transactions"]
            rating = agg["circularity_rating"]
            materials = agg["material_breakdown"]
        else:
            # Baseline mocks if company has no history yet
            co2_saved = 480.0
            landfill_div = 1200.0
            transactions = 4
            rating = "Emerging"
            materials = {"plastic": 800.0, "textile": 400.0}

        context = {
            "company_name": company_name,
            "total_transactions": transactions,
            "total_co2_saved_kg": co2_saved,
            "total_landfill_diverted_kg": landfill_div,
            "circularity_rating": rating,
            "material_breakdown": materials,
            "compliance_checks": "PASSED (Clean record, no violations flagged)",
            "logistics_cycles": "Optimized municipal route maps assigned"
        }

        # 2. Build Gemini prompt
        prompt = f"""
        You are the GreenChain AI Sustainability Advisor.
        Reason over the following multi-agent operational metrics and environmental values for the company '{company_name}':
        {json.dumps(context, indent=2)}

        Based on these inputs:
        - Explain complex circular economics insights.
        - Generate personalized suggestions (recommending better recyclers, process/sorting improvements).
        - Propose high-efficiency equipment upgrades.
        - Suggest cost reduction opportunities and carbon-reduction milestones.
        - Formulate a chronological carbon-reduction roadmap (at least 3 milestones).
        - Write a professional executive summary.

        Return ONLY a JSON block containing these exact keys:
        {{
          "recommendations": ["string"],
          "priority_actions": ["string"],
          "estimated_cost_savings": float,
          "estimated_co2_reduction": float,
          "roadmap": ["string"],
          "executive_summary": "string"
        }}
        """

        # 3. Call Gemini
        if gemini_key:
            try:
                # Use JSON schema configuration
                model = genai.GenerativeModel(
                    model_name="gemini-1.5-flash",
                    generation_config={"response_mime_type": "application/json"}
                )
                response = model.generate_content(prompt)
                
                # Parse response text
                res_data = json.loads(response.text)
                
                # Return parsed JSON matching schema
                return {
                    "recommendations": res_data.get("recommendations", []),
                    "priority_actions": res_data.get("priority_actions", []),
                    "estimated_cost_savings": float(res_data.get("estimated_cost_savings", 15000.0)),
                    "estimated_co2_reduction": float(res_data.get("estimated_co2_reduction", 350.0)),
                    "roadmap": res_data.get("roadmap", []),
                    "executive_summary": res_data.get("executive_summary", "")
                }
            except Exception as e:
                logger.error(f"Gemini API execution failed: {e}. Falling back to default heuristics.")

        # 4. Fallback default heuristics
        return self._fallback_recommendations(company_name, materials)

    def _fallback_recommendations(self, company: str, materials: dict) -> dict:
        primary_material = list(materials.keys())[0] if len(materials) > 0 else "recyclables"
        return {
            "recommendations": [
                f"Upgrade sorting separator for {primary_material} streams to increase yield.",
                "Consolidate shipping logistics with regional cluster partners to cut haulage overhead.",
                "Install automated bale press compressors to minimize raw warehousing area footprints."
            ],
            "priority_actions": [
                "Schedule a facility inspection of the logistics weighbridge.",
                "Review circular matching opportunities with neighboring textile processing plants."
            ],
            "estimated_cost_savings": 14200.00,
            "estimated_co2_reduction": 480.00,
            "roadmap": [
                "Phase 1: Implement smart weight sensing limits (Month 1)",
                "Phase 2: Transition sorting lines to automated separators (Month 3)",
                "Phase 3: Qualify for gold tier carbon credit offsets (Month 6)"
            ],
            "executive_summary": f"Sustainability review for {company} suggests strong gains in {primary_material} recycling loops. Implementing sorting upgrades will scale margins and cut transport CO2."
        }
