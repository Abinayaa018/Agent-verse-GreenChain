from pydantic import BaseModel, Field
from typing import Optional, List

class TokenizeRequest(BaseModel):
    """Inbound request to tokenize carbon credits from an ESG audit contract."""
    contract_id: str = Field(..., description="Target contract ID from the ESG ledger")
    company_name: str = Field(..., description="Target company context")

class CarbonCertificate(BaseModel):
    """Stored carbon credit certificate registry item."""
    certificate_id: str = Field(..., description="Unique carbon certificate tracking ID")
    contract_id: str = Field(..., description="Original transaction contract ID")
    company_name: str = Field(..., description="Verifiable owner business name")
    co2_saved_kg: float = Field(..., description="Total CO2 reduction recorded")
    carbon_credits: float = Field(..., description="Number of equivalent carbon credits (1 credit = 1 ton of CO2)")
    market_value_inr: float = Field(..., description="Estimated marketplace valuation in INR")
    serial_number: str = Field(..., description="Unique certificate cryptographic serial number")
    timestamp: str = Field(..., description="Verification and tokenization timestamp")
    status: str = Field(..., description="Active, Transferred, or Retired")
