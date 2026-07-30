import os
import json
import logging
import hashlib
from datetime import datetime
import numpy as np
from dotenv import load_dotenv
import google.generativeai as genai
from .models import BidRequest, AuctionResponse, BidItem

logger = logging.getLogger("waste_auction.rules")

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))

# Load environment API keys
dotenv_path = os.path.join(AGENT_DIR, "..", "..", ".env")
load_dotenv(dotenv_path)

gemini_key = os.getenv("GEMINI_API_KEY")
if gemini_key:
    genai.configure(api_key=gemini_key)

class WasteAuctionEngine:
    """Intelligent waste auction coordinator managing bids and summarizing outcomes using Gemini."""

    def __init__(self):
        pass

    def run_simulated_auction(self, req: BidRequest) -> dict:
        np.random.seed(int(hashlib.md5(req.auction_id.encode()).hexdigest(), 16) % 1000)

        bidders = ["Coimbatore E-Hub", "Salem Scrap Yard", "Chennai Polymers", "Kovai Paper Mills", "Salem Steel"]
        np.random.shuffle(bidders)

        # Simulate 4 bids increasing in amount
        bid_history = []
        curr_price = req.reserve_price

        for i in range(1, 5):
            bidder = bidders[i % len(bidders)]
            # increase bid by 4% to 15%
            curr_price = float(np.round(curr_price * np.random.uniform(1.04, 1.15), 2))
            
            ts = datetime.now().strftime("%H:%M:%S")
            bid_history.append(BidItem(
                bidder=bidder,
                amount=curr_price,
                timestamp=ts
            ))

        winner_bid = bid_history[-1]
        avg_bid = float(np.round(np.mean([b.amount for b in bid_history]), 2))

        # Ask Gemini to write a summary analysis
        bids_formatted = json.dumps([{'bidder': b.bidder, 'amount': b.amount} for b in bid_history], indent=2)
        summary_prompt = f"""
        You are the GreenChain AI Auctioneer Agent.
        Analyze the waste auction result for material '{req.material_type}' ({req.quantity} kg) with reserve price ₹{req.reserve_price}/kg.
        Bids submitted:
        {bids_formatted}

        The winner is '{winner_bid.bidder}' with a winning bid of ₹{winner_bid.amount}/kg.
        Summarize the competitive dynamics, demand trends for this material category, and outline the overall premium gained over the reserve price.
        Limit to 3 sentences, professional tone.
        """

        outcome_summary = ""
        if gemini_key:
            try:
                model = genai.GenerativeModel("gemini-1.5-flash")
                response = model.generate_content(summary_prompt)
                outcome_summary = response.text.strip()
            except Exception as e:
                logger.error(f"Gemini auction summary failed: {e}")

        if not outcome_summary:
            premium_pct = round(((winner_bid.amount - req.reserve_price) / req.reserve_price) * 100, 1)
            outcome_summary = f"The waste auction for {req.material_type} concluded with strong interest from {len(bid_history)} recyclers. {winner_bid.bidder} claimed the contract at a premium of {premium_pct}% above the initial reserve price. This suggests solid spot demand and clean logistics matching for local recycling lines."

        return {
            "winner": winner_bid.bidder,
            "winning_bid": winner_bid.amount,
            "bid_history": [b.dict() for b in bid_history],
            "average_bid": avg_bid,
            "outcome_summary": outcome_summary
        }
