from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class ChatRequest(BaseModel):
    """Inbound chat message from the user."""
    message: str = Field(..., description="Natural language user prompt")

class ChatResponse(BaseModel):
    """Outbound structured and conversational response payload."""
    intent: str = Field(..., description="Detected intent: analyze, impact, pricing, logistics, etc.")
    entities: Dict[str, Any] = Field(..., description="Extracted entities: material, quantity, location, etc.")
    response: str = Field(..., description="Google Gemini-generated conversational response explaining rules output")
