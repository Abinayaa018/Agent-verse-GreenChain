from pydantic import BaseModel, Field
from typing import Optional, List

class KYCVerifyRequest(BaseModel):
    """Inbound request to submit KYC verification documents and fields."""
    company_name: str = Field(..., description="Legal business name of the factory or enterprise")
    gst_number: str = Field(..., description="Indian GSTIN number (15 digits)")
    pan: str = Field(..., description="Indian PAN number (10 alphanumeric digits)")
    reg_number: str = Field(..., description="Corporate Registration Number (CIN)")
    email: str = Field(..., description="Primary business contact email")
    phone: str = Field(..., description="Primary contact phone number")
    factory_address: str = Field(..., description="Physical factory location/address")
    document_url: Optional[str] = Field(default=None, description="URL of uploaded GST certificate document")

class KYCRecord(BaseModel):
    """Stored KYC registry record detailing verification outcomes."""
    id: str
    company_name: str
    gst_number: str
    pan: str
    reg_number: str
    email: str
    phone: str
    factory_address: str
    document_url: Optional[str]
    status: str  # Verified, Pending, Rejected
    timestamp: str
    remarks: str
