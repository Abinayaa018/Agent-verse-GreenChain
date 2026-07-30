import os
import json
import logging
from dotenv import load_dotenv
import google.generativeai as genai
from .models import HazardClassificationRequest, HazardClassificationResponse

logger = logging.getLogger("hazard_classification.rules")

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))

# Load env variables
dotenv_path = os.path.join(AGENT_DIR, "..", "..", ".env")
load_dotenv(dotenv_path)

gemini_key = os.getenv("GEMINI_API_KEY")
if gemini_key:
    genai.configure(api_key=gemini_key)

class HazardClassificationEngine:
    """Intelligent material safety data sheets (MSDS) and chemical hazard classifier using Gemini."""

    def __init__(self):
        pass

    def classify_waste_hazard(self, req: HazardClassificationRequest) -> dict:
        prompt = f"""
        You are the GreenChain AI Chemical Hazard Safety Specialist.
        Analyze this industrial waste run:
        Material: {req.material}
        Chemical Composition: {req.chemical_composition}
        Waste Description: {req.waste_description}
        MSDS Text details: {req.msds_text}

        Determine the classification:
        - hazard_category: (HAZARDOUS, NON-HAZARDOUS, TOXIC, CORROSIVE)
        - handling_procedures: (List of handling instructions)
        - ppe: (List of personal protective equipment)
        - storage: (Isolation or temperature requirements)
        - transport: (Safe carrier directives)
        - disposal: (Neutralization or recycling guidelines)

        Respond ONLY with a JSON object matching this structure:
        {{
          "hazard_category": "string",
          "handling_procedures": ["string"],
          "ppe": ["string"],
          "storage": "string",
          "transport": "string",
          "disposal": "string"
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
                logger.error(f"Gemini Waste Hazard query failed: {e}")

        return self._fallback_hazard_classification(req)

    def _fallback_hazard_classification(self, req: HazardClassificationRequest) -> dict:
        # Simple heuristics
        mc = req.material.lower()
        if "lead" in mc or "battery" in mc or "acid" in mc or "chemical" in mc:
            cat = "HAZARDOUS"
            ppe = ["Nitrile Gloves", "Safety Goggles", "Chemical Resistant Apron", "Face Shield"]
            proc = [
                "Avoid skin contact. Use spark-proof tools during removal.",
                "Ensure ventilation fans run at 100% capacity."
            ]
            storage = "Store inside a double-walled acid containment bin at temperatures below 25°C."
            trans = "Class 8 Hazmat carrier required with placard signage."
            disp = "Ship to authorized lead reclamation facilities for acid extraction and lead smelting."
        else:
            cat = "NON-HAZARDOUS"
            ppe = ["Cotton Gloves", "Steel Toe Boots", "Safety Glasses"]
            proc = ["Avoid inhaling loose dust fibers.", "Standard material handling routines apply."]
            storage = "Dry, well-ventilated warehouse container storage."
            trans = "Standard flatbed carrier or logisitcs transport."
            disp = "Direct to sorting shredders for mechanical granulation recycling."

        return {
            "hazard_category": cat,
            "handling_procedures": proc,
            "ppe": ppe,
            "storage": storage,
            "transport": trans,
            "disposal": disp
        }
