import os
import json
import logging
from dotenv import load_dotenv
import google.generativeai as genai
from typing import Dict, Any, List

# Load environment
dotenv_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
load_dotenv(dotenv_path)

logger = logging.getLogger("chatbot.rules")

# Configure Gemini
gemini_key = os.getenv("GEMINI_API_KEY")
if gemini_key:
    genai.configure(api_key=gemini_key)
else:
    logger.warning("GEMINI_API_KEY is not defined. Chatbot will use fallback rules.")

class ChatbotOrchestrator:
    """Orchestrates natural language parsing and routes queries to correct rules.py engines."""

    def __init__(self):
        # We can dynamically import inside methods to avoid circular dependencies
        pass

    def parse_message(self, message: str) -> Dict[str, Any]:
        """Uses Gemini to perform NLU: extract intent and entities."""
        if not gemini_key:
            return self._fallback_nlu(message)

        prompt = (
            f"Analyze the following natural language user message for an industrial circular economy platform:\n"
            f"\"{message}\"\n\n"
            f"Categorize the intent into one of: 'analyze', 'impact', 'pricing', 'marketplace', 'matching', 'logistics', 'compliance', 'innovation', 'audit', 'dashboard', 'general'.\n"
            f"Extract entities: 'material', 'quantity' (as a number), 'unit' (kg or tons), 'location', 'company', 'destination'.\n\n"
            f"Respond ONLY in this exact JSON format, do not include any other text:\n"
            f"{{\n"
            f"  \"intent\": \"intent_name\",\n"
            f"  \"entities\": {{\n"
            f"    \"material\": \"material_name_or_null\",\n"
            f"    \"quantity\": quantity_number_or_null,\n"
            f"    \"unit\": \"unit_or_null\",\n"
            f"    \"location\": \"location_or_null\",\n"
            f"    \"company\": \"company_or_null\",\n"
            f"    \"destination\": \"destination_or_null\"\n"
            f"  }}\n"
            f"}}"
        )

        try:
            model = genai.GenerativeModel("gemini-3.5-flash")
            response = model.generate_content(prompt)
            text = response.text.strip()
            
            # Clean markdown code fences if present
            if text.startswith("```json"):
                text = text[7:]
            elif text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

            parsed = json.loads(text)
            # Standardize output structure
            return {
                "intent": parsed.get("intent", "general"),
                "entities": parsed.get("entities", {})
            }
        except Exception as e:
            logger.error(f"Gemini NLU failed: {e}")
            return self._fallback_nlu(message)

    def _fallback_nlu(self, message: str) -> Dict[str, Any]:
        """Simple regex/keyword based fallback NLU when LLM is unavailable."""
        msg_lower = message.lower()
        intent = "general"
        material = None
        quantity = None
        unit = "kg"
        location = None

        if "analyze" in msg_lower or "profile" in msg_lower:
            intent = "analyze"
        elif "impact" in msg_lower or "co2" in msg_lower or "carbon" in msg_lower:
            intent = "impact"
        elif "price" in msg_lower or "valuation" in msg_lower or "cost" in msg_lower or "value" in msg_lower:
            intent = "pricing"
        elif "logistics" in msg_lower or "route" in msg_lower or "distance" in msg_lower or "transport" in msg_lower:
            intent = "logistics"
        elif "matching" in msg_lower or "resource" in msg_lower or "match" in msg_lower:
            intent = "matching"
        elif "innovation" in msg_lower or "pathway" in msg_lower or "recycle" in msg_lower:
            intent = "innovation"
        elif "audit" in msg_lower or "report" in msg_lower or "esg" in msg_lower:
            intent = "audit"
        elif "kyc" in msg_lower or "verify" in msg_lower:
            intent = "compliance"
        elif "sell" in msg_lower or "buy" in msg_lower or "marketplace" in msg_lower:
            intent = "marketplace"
        elif "dashboard" in msg_lower or "summary" in msg_lower:
            intent = "dashboard"

        # Basic entity extractions
        if "plastic" in msg_lower:
            material = "Plastic"
        elif "metal" in msg_lower:
            material = "Metal"
        elif "battery" in msg_lower:
            material = "Battery Waste"
        elif "cotton" in msg_lower:
            material = "Cotton Scrap"

        if "coimbatore" in msg_lower:
            location = "Coimbatore"
        elif "tiruppur" in msg_lower:
            location = "Tiruppur"
        elif "chennai" in msg_lower:
            location = "Chennai"

        # Regex for numbers
        import re
        nums = re.findall(r"\d+", msg_lower)
        if nums:
            quantity = float(nums[0])
            if "ton" in msg_lower or "t " in msg_lower or "tons" in msg_lower:
                unit = "tons"

        return {
            "intent": intent,
            "entities": {
                "material": material,
                "quantity": quantity,
                "unit": unit,
                "location": location,
                "company": "Tiruppur Textiles",
                "destination": "Authorized Recycler"
            }
        }

    def generate_chat_response(self, intent: str, entities: Dict[str, Any], raw_result: Dict[str, Any]) -> str:
        """Uses Gemini to explain structured rules results conversationally."""
        if not gemini_key:
            return self._fallback_nlg(intent, entities, raw_result)

        prompt = (
            f"You are Green-Chain AI, an intelligent conversational enterprise assistant for industrial waste management.\n"
            f"The user query intent is: '{intent}'\n"
            f"The extracted entities are: {json.dumps(entities)}\n"
            f"The structured rule-based backend output was: {json.dumps(raw_result)}\n\n"
            f"Task: Turn this structured JSON output into a professional, conversational response.\n"
            f"- Summarize key facts (e.g. carbon savings, price recommendations, compliance score, recycling pathways).\n"
            f"- Format the response using clean markdown, bolding, and bullet points where appropriate.\n"
            f"- Explain the industrial or environmental value to the enterprise clearly.\n"
            f"- Keep it concise, professional, and action-oriented."
        )

        try:
            model = genai.GenerativeModel("gemini-3.5-flash")
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini NLG failed: {e}")
            return self._fallback_nlg(intent, entities, raw_result)

    def _fallback_nlg(self, intent: str, entities: Dict[str, Any], raw_result: Dict[str, Any]) -> str:
        """Deterministic response formatter when Gemini is unavailable."""
        material = entities.get("material") or "Material"
        quantity = entities.get("quantity") or 100
        unit = entities.get("unit") or "kg"

        lines = [
            f"### Green-Chain AI System Alert",
            f"The conversational AI model is currently offline. Here is the structured summary for your **{intent}** request regarding **{quantity} {unit} of {material}**:",
            "",
            "**Structured Outcome Data:**"
        ]
        
        for k, v in raw_result.items():
            if isinstance(v, dict):
                lines.append(f"- **{k.title()}**:")
                for sub_k, sub_v in v.items():
                    lines.append(f"  - {sub_k}: {sub_v}")
            elif isinstance(v, list):
                lines.append(f"- **{k.title()}**:")
                for item in v:
                    lines.append(f"  - {item}")
            else:
                lines.append(f"- **{k.title()}**: {v}")

        return "\n".join(lines)
