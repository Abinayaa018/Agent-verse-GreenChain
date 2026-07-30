from pydantic import BaseModel, Field

class ContractRequest(BaseModel):
    seller: str = Field(..., description="Seller company name")
    buyer: str = Field(..., description="Buyer company name")
    material: str = Field(..., description="Transacted material category")
    quantity: float = Field(..., description="Transacted weight in kg")
    price: float = Field(..., description="Agreed rate in INR per kg")
    delivery_clause: str = Field(..., description="Delivery timeline clause details")
    payment_clause: str = Field(..., description="Payment window clause details")
    penalty_clause: str = Field(..., description="Default contract penalty clause details")

class ContractResponse(BaseModel):
    contract_id: str = Field(..., description="Unique generated contract code")
    pdf_filename: str = Field(..., description="Generated agreement PDF filename")
    contract_json: str = Field(..., description="Formatted contract metadata JSON")
    signature_hash: str = Field(..., description="Digital signature verification hash")
    version: int = Field(1, description="Contract document version iteration")
