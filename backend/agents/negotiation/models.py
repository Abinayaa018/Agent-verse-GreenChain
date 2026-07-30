from pydantic import BaseModel, Field
from typing import List, Optional

class NegotiationTranscriptItem(BaseModel):
    round_num: int = Field(..., description="The index of the negotiation round")
    sender: str = Field(..., description="The sender of the offer (Buyer or Seller)")
    offer_price: float = Field(..., description="The offer price in INR per kg")
    message: str = Field(..., description="Bargaining argument message text")

class NegotiateRequest(BaseModel):
    buyer: str = Field(..., description="Name of the buyer company")
    seller: str = Field(..., description="Name of the seller company")
    material: str = Field(..., description="Type of material being negotiated")
    quantity: float = Field(..., description="Volume quantity in kg")
    target_price: float = Field(..., description="Target purchase price in INR per kg")
    urgency: str = Field(..., description="Bargaining urgency: high, medium, low")
    buyer_trust: Optional[float] = Field(8.5, description="Buyer trust index score")
    seller_trust: Optional[float] = Field(8.0, description="Seller trust index score")

class NegotiateResponse(BaseModel):
    transcript: List[NegotiationTranscriptItem] = Field(..., description="Multi-round negotiation conversation log")
    final_price: float = Field(..., description="The final agreed price in INR per kg")
    savings: float = Field(..., description="Savings achieved in INR compared to seller's initial quote")
    acceptance_probability: float = Field(..., description="Calculated deal acceptance probability index (0.0 to 1.0)")
    negotiation_score: float = Field(..., description="Calculated final deal quality score (0.0 to 10.0)")
