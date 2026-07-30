import os
import json
import logging
from dotenv import load_dotenv
import google.generativeai as genai
from .models import ProcurementRequest, ProcurementResponse

logger = logging.getLogger("circular_procurement.rules")

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))

# Load env variables
dotenv_path = os.path.join(AGENT_DIR, "..", "..", ".env")
load_dotenv(dotenv_path)

gemini_key = os.getenv("GEMINI_API_KEY")
if gemini_key:
    genai.configure(api_key=gemini_key)

class CircularProcurementEngine:
    """Intelligent green sourcing and circular materials procurement advisor using Gemini."""

    def __init__(self):
        pass

    def recommend_circular_procurement(self, req: ProcurementRequest) -> dict:
        prompt = f"""
        You are the GreenChain AI Circular Procurement Specialist.
        Propose green procurement strategies for:
        Required Material: {req.required_material}
        Industry: {req.industry}
        Budget Unit: ₹{req.budget}/kg
        Quality Grade Target: {req.quality}

        Provide:
        - recommended_suppliers: (List of 2-3 ecological recycling suppliers names)
        - alternative_materials: (List of 2 secondary circular material alternatives)
        - cost_reduction_suggestions: (Tips to lower procurement budgets)
        - sustainability_improvements: (Carbon and landfill mitigation tips)
        - advisory_brief: (A brief executive review summary)

        Respond ONLY with a JSON object matching this structure:
        {{
          "recommended_suppliers": ["string"],
          "alternative_materials": ["string"],
          "cost_reduction_suggestions": ["string"],
          "sustainability_improvements": ["string"],
          "advisory_brief": "string"
        }}
        """

        if gemini_key:
            try:
                model = genai.GenerativeModel(
                    model_name="gemini-1.5-flash",
                    generation_config={"response_mime_type": "application/json"}
                )
                response = model.generate_content(prompt)
                res_data = json.loads(response.text)
                return res_data
            except Exception as e:
                logger.error(f"Gemini Circular Procurement query failed: {e}")

        return self._fallback_circular_procurement(req)

    def _fallback_circular_procurement(self, req: ProcurementRequest) -> dict:
        # Static mock matching parameters
        return {
            "recommended_suppliers": [
                "Kovai Eco-Polymers Ltd (Grade A Recycled)",
                "Tiruppur Scrap Processing Coop"
            ],
            "alternative_materials": [
                "Bio-degradable Cellulose Film",
                "High Purity Post-Consumer Grind"
            ],
            "cost_reduction_suggestions": [
                "Establish multi-year takeback agreements with the supplier.",
                "Consolidate logistics shipping routes to utilize regional sorting hubs."
            ],
            "sustainability_improvements": [
                "Sourcing post-consumer scrap cuts raw carbon footprint by 42%.",
                "Utilizing certified regional scrap diverts 1.2 metric tons of landfill waste."
            ],
            "advisory_brief": f"Procurement advisory recommends Kovai Eco-Polymers. Sourcing recycled alternatives for '{req.required_material}' matches the ₹{req.budget}/kg target while improving compliance credits."
        }
