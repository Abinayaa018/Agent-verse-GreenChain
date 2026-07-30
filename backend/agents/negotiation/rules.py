import os
import json
import logging
import numpy as np
import pandas as pd
from dotenv import load_dotenv
import google.generativeai as genai
from .models import NegotiateRequest, NegotiateResponse

logger = logging.getLogger("negotiation.rules")

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(AGENT_DIR, "dataset")

os.makedirs(DATASET_DIR, exist_ok=True)

CSV_PATH = os.path.join(DATASET_DIR, "negotiation_history.csv")

# Load environment API keys
dotenv_path = os.path.join(AGENT_DIR, "..", "..", ".env")
load_dotenv(dotenv_path)

gemini_key = os.getenv("GEMINI_API_KEY")
if gemini_key:
    genai.configure(api_key=gemini_key)

class NegotiationEngine:
    """Intelligent automated commercial deal negotiation engine using Gemini 1.5 Flash."""

    def __init__(self):
        self.generate_dataset_if_missing()

    def generate_dataset_if_missing(self):
        if os.path.exists(CSV_PATH):
            return

        logger.info("Generating synthetic negotiation history CSV...")
        np.random.seed(42)

        buyers = ["Tiruppur Textiles", "EcoFibre Ltd", "Electro-Recycle", "Kovai Paper Mills"]
        sellers = ["Chennai Polymers", "Salem Steel", "Coimbatore E-Hub", "Salem Scrap Yard"]
        materials = ["plastic", "metal", "battery", "paper", "textile"]

        records = []
        for i in range(4000):
            buyer = np.random.choice(buyers)
            seller = np.random.choice(sellers)
            mat = np.random.choice(materials)
            qty = float(np.random.randint(500, 10000))
            
            base_p = 20 if mat == "plastic" else 100 if mat == "metal" else 15
            seller_init = float(np.round(base_p * np.random.uniform(1.1, 1.3), 2))
            buyer_target = float(np.round(base_p * np.random.uniform(0.8, 0.95), 2))
            
            final_p = float(np.round(np.mean([seller_init, buyer_target]) + np.random.normal(0, base_p * 0.03), 2))
            rounds = int(np.random.randint(2, 6))
            success = np.random.choice([True, False], p=[0.85, 0.15])

            records.append({
                "buyer": buyer,
                "seller": seller,
                "material": mat,
                "quantity": qty,
                "seller_initial_price": seller_init,
                "buyer_target_price": buyer_target,
                "final_price": final_p if success else 0.0,
                "rounds": rounds,
                "success": int(success)
            })

        pd.DataFrame(records).to_csv(CSV_PATH, index=False)
        logger.info(f"Negotiation database saved successfully at {CSV_PATH} with 4000 rows.")

    def run_negotiation(self, req: NegotiateRequest) -> dict:
        self.generate_dataset_if_missing()

        # Calculate a reasonable seller starting price
        base_prices = {"plastic": 20.0, "metal": 100.0, "battery": 140.0, "paper": 10.0, "textile": 12.0}
        base_p = base_prices.get(req.material.lower().strip(), 25.0)
        
        seller_initial_quote = float(np.round(base_p * 1.25, 2))

        # Context details
        context = {
            "buyer": req.buyer,
            "seller": req.seller,
            "material": req.material,
            "quantity": req.quantity,
            "buyer_target_price": req.target_price,
            "seller_initial_quote": seller_initial_quote,
            "urgency": req.urgency,
            "buyer_trust": req.buyer_trust,
            "seller_trust": req.seller_trust
        }

        prompt = f"""
        You are the GreenChain AI Commercial Negotiation Agent.
        Conduct a multi-round (3 to 4 rounds) commercial bargaining deal between:
        Buyer: {req.buyer} (Trust: {req.buyer_trust})
        Seller: {req.seller} (Trust: {req.seller_trust})
        Material: {req.material} ({req.quantity} kg)
        Buyer Target Price: ₹{req.target_price}/kg
        Seller Starting Price: ₹{seller_initial_quote}/kg
        Urgency Level: {req.urgency}

        Generate a realistic negotiation dialogue. The seller is trying to keep prices high, and the buyer is pushing for discounts. 
        Each round, the parties should compromise slightly, building up to an agreed final price.
        Calculate the total savings = (Seller Initial Quote - Final Price) * Quantity.
        Determine:
        - final_price (must be between buyer target and seller quote)
        - acceptance_probability (0.0 to 1.0)
        - negotiation_score (0.0 to 10.0 based on how close the final price is to target price and trust scores)

        Respond ONLY with a JSON block matching this structure:
        {{
          "transcript": [
            {{
              "round_num": 1,
              "sender": "Buyer" | "Seller",
              "offer_price": float,
              "message": "sentence argument"
            }}
          ],
          "final_price": float,
          "savings": float,
          "acceptance_probability": float,
          "negotiation_score": float
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
                logger.error(f"Gemini negotiation reasoning failed: {e}")

        # Fallback multi-round dialog generator
        return self._fallback_negotiation(req, seller_initial_quote)

    def _fallback_negotiation(self, req: NegotiateRequest, seller_init: float) -> dict:
        target = req.target_price
        final_price = float(np.round(np.mean([seller_init, target]), 2))
        savings = float(np.round((seller_init - final_price) * req.quantity, 2))
        
        transcript = [
            {
                "round_num": 1,
                "sender": "Seller",
                "offer_price": seller_init,
                "message": f"Initial listing quote at ₹{seller_init}/kg based on premium quality check standards."
            },
            {
                "round_num": 2,
                "sender": "Buyer",
                "offer_price": target,
                "message": f"We are requesting a rate of ₹{target}/kg since we are scheduling a high-volume {req.quantity} kg run."
            },
            {
                "round_num": 3,
                "sender": "Seller",
                "offer_price": final_price,
                "message": f"We can meet halfway at ₹{final_price}/kg as a gesture of long-term business collaboration."
            }
        ]

        return {
            "transcript": transcript,
            "final_price": final_price,
            "savings": savings,
            "acceptance_probability": 0.88,
            "negotiation_score": 8.2
        }
