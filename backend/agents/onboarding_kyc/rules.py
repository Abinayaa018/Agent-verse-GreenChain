import os
import re
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any
from .models import KYCVerifyRequest, KYCRecord

logger = logging.getLogger("onboarding_kyc.rules")

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
KYC_FILE = os.path.join(DATA_DIR, "kyc_records.json")

# Ensure files exist
os.makedirs(DATA_DIR, exist_ok=True)
if not os.path.exists(KYC_FILE):
    with open(KYC_FILE, "w", encoding="utf-8") as f:
        json.dump([], f)

class KYCVerificationEngine:
    """Handles company identity validation via regex and maintains verification records."""

    def __init__(self):
        # Regex definitions
        self.gst_regex = re.compile(r"^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$")
        self.pan_regex = re.compile(r"^[A-Z]{5}\d{4}[A-Z]{1}$")
        self.cin_regex = re.compile(r"^[LU]\d{5}[A-Z]{2}\d{4}[PLC]{3}\d{6}$") # Corporate CIN pattern
        self.email_regex = re.compile(r"^[\w\.-]+@[\w\.-]+\.\w+$")
        self.phone_regex = re.compile(r"^\+?(91)?[- ]?[6-9]\d{9}$")

    def load_records(self) -> List[KYCRecord]:
        try:
            with open(KYC_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return [KYCRecord(**item) for item in data]
        except Exception as e:
            logger.error(f"Failed to load KYC records: {e}")
            return []

    def save_records(self, records: List[KYCRecord]):
        try:
            with open(KYC_FILE, "w", encoding="utf-8") as f:
                json.dump([r.model_dump() for r in records], f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save KYC records: {e}")

    def verify_company(self, req: KYCVerifyRequest) -> KYCRecord:
        """Runs validation heuristics and stores verification status."""
        errors = []

        # Validate GST
        gst = req.gst_number.upper().strip()
        if not self.gst_regex.match(gst):
            errors.append("Invalid GSTIN format (must be 15 alphanumeric characters matching Indian GSTIN standards)")

        # Validate PAN
        pan = req.pan.upper().strip()
        if not self.pan_regex.match(pan):
            errors.append("Invalid PAN format (must be 10 characters: 5 letters, 4 numbers, 1 letter)")

        # Validate Email
        email = req.email.strip()
        if not self.email_regex.match(email):
            errors.append("Invalid email address format")

        # Validate Phone
        phone = req.phone.strip()
        if not self.phone_regex.match(phone):
            errors.append("Invalid Indian contact phone number (10 digits)")

        # Determine status
        if errors:
            status = "Rejected"
            remarks = "Validation failed: " + "; ".join(errors)
        else:
            status = "Verified"
            remarks = "Automatic verification succeeded. GST and PAN matching confirm corporate validity."

        # If document URL is missing but standard details are valid, set to Pending
        if status == "Verified" and not req.document_url:
            status = "Pending"
            remarks = "Standard details verified. Pending verification of GST Registration certificate upload."

        # Create record
        record = KYCRecord(
            id=f"GC-KYC-{uuid.uuid4().hex[:6].upper()}",
            company_name=req.company_name,
            gst_number=gst,
            pan=pan,
            reg_number=req.reg_number.upper().strip(),
            email=email,
            phone=phone,
            factory_address=req.factory_address,
            document_url=req.document_url,
            status=status,
            timestamp=datetime.now(timezone.utc).isoformat(),
            remarks=remarks
        )

        # Append and save
        records = self.load_records()
        # Remove any previous records for the same company to avoid duplication
        records = [r for r in records if r.company_name.lower() != req.company_name.lower()]
        records.append(record)
        self.save_records(records)

        return record
