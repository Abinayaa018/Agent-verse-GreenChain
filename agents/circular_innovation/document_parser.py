"""Document processing layer — parses PDF reports and HTML technical documents into semantic chunks."""

import re
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger("circular_innovation.parser")


class DocumentChunk:
    """Document Chunk model."""
    pass


class DocumentParser:
    """Parser for scientific PDFs, technical HTML reports, and plain text documents."""

    def parse_text(self, text: str, source_metadata: Optional[Dict[str, Any]] = None, chunk_size: int = 400, overlap: int = 50) -> List[Dict[str, Any]]:
        """Clean and split text into overlapping semantic chunks with metadata headers."""
        if not text:
            return []

        # Remove extra whitespace
        cleaned = re.sub(r"\s+", " ", text).strip()
        words = cleaned.split()
        chunks: List[Dict[str, Any]] = []

        meta = source_metadata or {}
        source_title = meta.get("title", "Technical Document")
        source_url = meta.get("url", "https://greenchain.ai/docs")

        step = max(1, chunk_size - overlap)
        for i in range(0, len(words), step):
            chunk_words = words[i:i + chunk_size]
            chunk_text = " ".join(chunk_words)
            if len(chunk_text) > 30:
                chunks.append({
                    "chunk_id": len(chunks) + 1,
                    "text": chunk_text,
                    "source_title": source_title,
                    "source_url": source_url,
                    "word_count": len(chunk_words),
                    "metadata": meta
                })
        return chunks

    def parse_pdf_bytes(self, pdf_bytes: bytes, source_metadata: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Extract text from PDF using PyMuPDF if installed, else regex fallback."""
        extracted_text = ""
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            for page in doc:
                extracted_text += page.get_text() + "\n"
        except ImportError:
            logger.info("PyMuPDF (fitz) not installed; using standard text parser.")
            extracted_text = pdf_bytes.decode("utf-8", errors="ignore")
        except Exception as e:
            logger.warning(f"Error parsing PDF bytes: {e}")
            extracted_text = pdf_bytes.decode("utf-8", errors="ignore")

        return self.parse_text(extracted_text, source_metadata)

    def parse_html_string(self, html_str: str, source_metadata: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Extract clean text from HTML using BeautifulSoup."""
        try:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(html_str, "html.parser")
            # Remove scripts and style tags
            for script in soup(["script", "style", "nav", "footer"]):
                script.extract()
            text = soup.get_text(separator=" ")
        except ImportError:
            text = re.sub(r"<[^>]+>", " ", html_str)
        except Exception:
            text = re.sub(r"<[^>]+>", " ", html_str)

        return self.parse_text(text, source_metadata)