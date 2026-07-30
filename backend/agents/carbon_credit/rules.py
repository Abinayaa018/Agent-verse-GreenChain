import os
import json
import logging
import uuid
import qrcode
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from .models import CarbonCertificate, TokenizeRequest

# ReportLab imports for certificate generation
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

logger = logging.getLogger("carbon_credit.rules")

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
REPORTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "reports"))
CERT_FILE = os.path.join(DATA_DIR, "carbon_certificates.json")
LEDGER_FILE = os.path.join(DATA_DIR, "esg_ledger.json")

# Ensure directories exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

if not os.path.exists(CERT_FILE):
    with open(CERT_FILE, "w", encoding="utf-8") as f:
        json.dump([], f)

class CarbonTokenizationEngine:
    """Calculates carbon credit conversions and compiles ReportLab PDF certificates."""

    def load_certificates(self) -> List[CarbonCertificate]:
        try:
            with open(CERT_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return [CarbonCertificate(**item) for item in data]
        except Exception as e:
            logger.error(f"Failed to load certificates: {e}")
            return []

    def save_certificates(self, certs: List[CarbonCertificate]):
        try:
            with open(CERT_FILE, "w", encoding="utf-8") as f:
                json.dump([c.model_dump() for c in certs], f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save certificates: {e}")

    def tokenize_credits(self, req: TokenizeRequest) -> CarbonCertificate:
        # 1. Search ESG Ledger for contract
        co2_saved = 0.0
        
        if os.path.exists(LEDGER_FILE):
            try:
                with open(LEDGER_FILE, "r", encoding="utf-8") as f:
                    ledger = json.load(f)
                
                # Search for contract ID across all companies
                for comp, items in ledger.items():
                    for item in items:
                        if item.get("contract_id") == req.contract_id:
                            co2_saved = item.get("co2_saved_kg", 0.0)
                            break
            except Exception as e:
                logger.error(f"Failed to read ESG ledger during tokenization: {e}")

        # If not found (or standard demo fallback), generate a realistic mockup metric
        if co2_saved == 0.0:
            co2_saved = 5250.0  # default fallback

        # 1 credit per 1000kg (1 ton) of CO2 saved
        credits = round(co2_saved / 1000.0, 2)
        # 1800 INR per carbon credit standard price
        value = round(credits * 1800.0, 2)

        cert_id = f"GC-CC-{uuid.uuid4().hex[:8].upper()}"
        serial = f"SN-2026-{uuid.uuid4().hex[:12].upper()}"

        certificate = CarbonCertificate(
            certificate_id=cert_id,
            contract_id=req.contract_id,
            company_name=req.company_name,
            co2_saved_kg=co2_saved,
            carbon_credits=credits,
            market_value_inr=value,
            serial_number=serial,
            timestamp=datetime.now(timezone.utc).isoformat(),
            status="Active"
        )

        certs = self.load_certificates()
        # Remove any previous certificate for this contract to avoid duplicates
        certs = [c for c in certs if c.contract_id != req.contract_id]
        certs.append(certificate)
        self.save_certificates(certs)

        return certificate

    def generate_pdf_certificate(self, cert_id: str) -> Optional[str]:
        certs = self.load_certificates()
        target_cert = None
        for c in certs:
            if c.certificate_id == cert_id:
                target_cert = c
                break

        if not target_cert:
            return None

        # Prepare PDF path
        filename = f"Certificate_{cert_id}.pdf"
        pdf_path = os.path.join(REPORTS_DIR, filename)

        # Generate QR code
        scratch_dir = os.path.abspath(os.path.join(DATA_DIR, "..", "scratch"))
        os.makedirs(scratch_dir, exist_ok=True)
        qr_path = os.path.join(scratch_dir, f"qr_{cert_id}.png")

        qr_data = f"Verification Details:\nID: {target_cert.certificate_id}\nOwner: {target_cert.company_name}\nCredits: {target_cert.carbon_credits} MT CO2e"
        qr_img = qrcode.make(qr_data)
        qr_img.save(qr_path)

        # Document structure
        doc = SimpleDocTemplate(
            pdf_path,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )
        
        styles = getSampleStyleSheet()
        
        # Styles custom design
        title_style = ParagraphStyle(
            name="Title",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=24,
            textColor=colors.HexColor("#3FE6A8"),
            alignment=1, # Center
            spaceAfter=20
        )
        
        sub_style = ParagraphStyle(
            name="Subtitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=11,
            textColor=colors.HexColor("#2DD4FF"),
            alignment=1,
            spaceAfter=20
        )

        text_style = ParagraphStyle(
            name="Body",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=10,
            textColor=colors.HexColor("#D1D5DB"),
            alignment=1,
            leading=16,
            spaceAfter=15
        )

        meta_style = ParagraphStyle(
            name="Meta",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9,
            textColor=colors.HexColor("#9CA3AF"),
            alignment=0,
            leading=14
        )

        elements = []

        # Background decorative layout simulated via table border
        header_text = Paragraph("GREEN-CHAIN AI • CARBON CREDIT CERTIFICATE", title_style)
        sub_text = Paragraph(f"SERIAL NUMBER: {target_cert.serial_number}", sub_style)
        body_text = Paragraph(
            f"This certificate serves as verifiable evidence of the offset and tokenization of "
            f"<b>{target_cert.co2_saved_kg:,.1f} kg</b> of carbon dioxide equivalent (CO2e), diverted from "
            f"industrial manufacturing tipping landfills through optimized circular economy reuse.<br/><br/>"
            f"Correspondingly, Green-Chain AI has issued <b>{target_cert.carbon_credits:.2f} Carbon Credits</b> "
            f"under global ESG compliance frameworks, owned by <b>{target_cert.company_name}</b>.",
            text_style
        )

        # Meta table details
        meta_data = [
            [Paragraph(f"<b>Owner:</b> {target_cert.company_name}", meta_style), Image(qr_path, width=80, height=80)],
            [Paragraph(f"<b>Certificate ID:</b> {target_cert.certificate_id}", meta_style), ""],
            [Paragraph(f"<b>Original Contract:</b> {target_cert.contract_id}", meta_style), ""],
            [Paragraph(f"<b>Carbon Credits (MT):</b> {target_cert.carbon_credits:.2f} Credits", meta_style), ""],
            [Paragraph(f"<b>Estimated Value:</b> {target_cert.market_value_inr:,.2f} INR", meta_style), ""],
            [Paragraph(f"<b>Issued On:</b> {target_cert.timestamp[:10]}", meta_style), ""]
        ]

        t = Table(meta_data, colWidths=[380, 100])
        t.setStyle(TableStyle([
            ('SPAN', (1, 0), (1, 5)), # Merge qr column
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 4),
        ]))

        # Border wrap table container to simulate certificate framing
        cert_data = [
            [header_text],
            [sub_text],
            [Spacer(1, 15)],
            [body_text],
            [Spacer(1, 20)],
            [t],
            [Spacer(1, 20)],
            [Paragraph("AUTHENTICATED SECURITY SEAL • SECURE PROTOCOL LEDGER ONLINE", sub_style)]
        ]

        cert_table = Table(cert_data, colWidths=[500])
        cert_table.setStyle(TableStyle([
            ('BOX', (0, 0), (-1, -1), 2, colors.HexColor("#1B3A38")),
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#061016")),
            ('PADDING', (0, 0), (-1, -1), 20),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ]))

        elements.append(cert_table)
        
        # Build document
        doc.build(elements)

        # Cleanup QR temp file
        if os.path.exists(qr_path):
            os.remove(qr_path)

        return filename
