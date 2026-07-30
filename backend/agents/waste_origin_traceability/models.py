from pydantic import BaseModel, Field
from typing import List

class CheckpointItem(BaseModel):
    timestamp: str = Field(..., description="Date and time of check-in")
    location: str = Field(..., description="Checkpoint facility location name")
    handler: str = Field(..., description="Operator handler name")
    status: str = Field(..., description="Shipment status: generated, sorted, transported, processed, recycled")
    gps: str = Field(..., description="Checkpoint GPS coordinates")
    verified: bool = Field(True, description="Blockchain consensus verify flag")

class TraceabilityRequest(BaseModel):
    passport_id: str = Field(..., description="Material Passport code")

class CheckpointRequest(BaseModel):
    passport_id: str = Field(..., description="Material Passport code")
    handler: str = Field(..., description="Operator handler name")
    location: str = Field(..., description="Facility check-in location")
    status: str = Field(..., description="Current status message")

class TraceabilityResponse(BaseModel):
    passport_id: str = Field(..., description="Material Passport code")
    material_type: str = Field(..., description="Cargo material category")
    quantity: float = Field(..., description="Total batch weight in kg")
    origin_city: str = Field(..., description="Origin collection city")
    checkpoints: List[CheckpointItem] = Field(..., description="Chronological custody checkpoints sequence")
    verification_hash: str = Field(..., description="SHA256 consensus validation code")
    qr_code_path: str = Field(..., description="Passport QR code download URL")
