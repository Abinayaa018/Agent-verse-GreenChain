import os
import logging
from dotenv import load_dotenv
import google.generativeai as genai
from .models import TranslateRequest, TranslateResponse

# Load environment
dotenv_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
load_dotenv(dotenv_path)

logger = logging.getLogger("multilingual.rules")

# Configure Gemini
gemini_key = os.getenv("GEMINI_API_KEY")
if gemini_key:
    genai.configure(api_key=gemini_key)

class TranslationEngine:
    """Uses Gemini to translate content into Indian regional languages."""

    def translate(self, req: TranslateRequest) -> TranslateResponse:
        if not gemini_key:
            return TranslateResponse(translated_text=req.text) # fallback to original

        prompt = (
            f"Translate the following text into target language: '{req.target_lang}'.\n"
            f"Respond ONLY with the direct translated text. Do not add any explanations, notes, or introductions.\n\n"
            f"Text: \"{req.text}\""
        )

        try:
            model = genai.GenerativeModel("gemini-3.5-flash")
            response = model.generate_content(prompt)
            translated = response.text.strip()
            return TranslateResponse(translated_text=translated)
        except Exception as e:
            logger.error(f"Gemini translation failed: {e}")
            return TranslateResponse(translated_text=req.text)
