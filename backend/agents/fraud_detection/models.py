from pydantic import BaseModel, Field
from typing import List

class FraudDetectionRequest(BaseModel):
    transaction_id: str = Field(..., description="Unique code for marketplace transaction")
    buyer: str = Field(..., description="Buyer organization name")
    seller: str = Field(..., description="Seller organization name")
    material: str = Field(..., description="Transacted material type")
    quantity: float = Field(..., description="Material volume quantity in kg")
    price: float = Field(..., description="Agreed unit price in INR per kg")
    distance: float = Field(..., description="Shipping transport distance in km")
    trust_score: float = Field(..., description="Entity trust score index (0.0 to 10.0)")
    payment_delay: int = Field(..., description="Delay in invoice payment processing in days")
    duplicate_contract: bool = Field(..., description="Flag verifying if a contract duplicate was flagged")

class FraudDetectionResponse(BaseModel):
    fraud_probability: float = Field(..., description="Estimated fraud probability score (0.0 to 1.0)")
    risk_level: str = Field(..., description="Assessed threat level (LOW, MEDIUM, HIGH, CRITICAL)")
    fraud_reasons: List[str] = Field(..., description="List of reasons for suspicious classification")
    duplicate_detected: bool = Field(..., description="Duplicate contract check confirmation")
    recommended_action: str = Field(..., description="Recommended mitigation advisory action")
