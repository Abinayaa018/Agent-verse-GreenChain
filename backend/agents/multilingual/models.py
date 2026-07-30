from pydantic import BaseModel, Field

class TranslateRequest(BaseModel):
    """Inbound translation request containing prompt text and language."""
    text: str = Field(..., description="Text content to be translated")
    target_lang: str = Field(..., description="Target language (English, Tamil, Hindi, Kannada, Malayalam, Telugu)")

class TranslateResponse(BaseModel):
    """Outbound translation response."""
    translated_text: str = Field(..., description="Translated text result")
