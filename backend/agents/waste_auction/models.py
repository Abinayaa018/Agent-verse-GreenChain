from pydantic import BaseModel, Field
from typing import List

class BidItem(BaseModel):
    bidder: str = Field(..., description="Name of the bidder recycler")
    amount: float = Field(..., description="Bidded price in INR per kg")
    timestamp: str = Field(..., description="Check-in timestamp of the bid")

class BidRequest(BaseModel):
    auction_id: str = Field(..., description="Unique code of the material auction")
    material_type: str = Field(..., description="Type of material up for auction")
    quantity: float = Field(..., description="Quantity of material in kg")
    reserve_price: float = Field(..., description="Reserve minimum price in INR per kg")
    time_limit_mins: int = Field(..., description="Auction countdown time window in minutes")

class AuctionResponse(BaseModel):
    winner: str = Field(..., description="Winning bidder name")
    winning_bid: float = Field(..., description="Winning final bid in INR per kg")
    bid_history: List[BidItem] = Field(..., description="Full historical bid logs sequence")
    average_bid: float = Field(..., description="Average price bid in INR per kg")
    outcome_summary: str = Field(..., description="AI synthesized analysis of the auction results")
