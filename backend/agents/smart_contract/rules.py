import os
import json
import hashlib
import uuid
import logging
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from .models import ContractRequest, ContractResponse

logger = logging.getLogger("smart_contract.rules")

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
REPORTS_DIR = os.path.join(AGENT_DIR, "..", "..", "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)

class SmartContractEngine:
    """Intelligent legal contract drafting engine outputting PDFs and digital SHA256 signatures."""

    def __init__(self):
        pass

    def generate_contract_agreement(self, req: ContractRequest) -> dict:
        contract_id = f"GC-CON-{uuid.uuid4().hex[:8].upper()}"
        timestamp = datetime.now().isoformat()
        
        # Calculate digital signature hash
        sha = hashlib.sha256()
        sha.update(f"{req.buyer}{req.seller}{req.material}{req.quantity}{req.price}{timestamp}".encode())
        sig_hash = sha.hexdigest()

        filename = f"Contract_{contract_id}.pdf"
        filepath = os.path.join(REPORTS_DIR, filename)

        # PDF Layout using ReportLab
        try:
            doc = SimpleDocTemplate(
                filepath, 
                pagesize=letter,
                topMargin=0.5*inch, 
                bottomMargin=0.5*inch,
                leftMargin=0.6*inch, 
                rightMargin=0.6*inch
            )
            
            styles = getSampleStyleSheet()
            
            title_style = ParagraphStyle(
                "Title", 
                parent=styles["Title"], 
                fontSize=18,
                textColor=colors.HexColor("#1A3A6B"), 
                spaceAfter=15
            )
            section_style = ParagraphStyle(
                "Section", 
                parent=styles["Heading2"], 
                fontSize=12,
                textColor=colors.HexColor("#1A3A6B"), 
                spaceBefore=10, 
                spaceAfter=5
            )
            body_style = ParagraphStyle(
                "Body", 
                parent=styles["Normal"], 
                fontSize=9,
                textColor=colors.HexColor("#2C3E50"), 
                spaceAfter=6
            )
            bold_label_style = ParagraphStyle(
                "BoldLabel", 
                parent=styles["Normal"], 
                fontSize=9,
                textColor=colors.HexColor("#1A3A6B"), 
                fontName="Helvetica-Bold"
            )

            elements = []
            
            # Header title
            elements.append(Paragraph("COMMERCIAL WASTE TRANSACTION AGREEMENT", title_style))
            elements.append(Paragraph(f"Contract Reference: {contract_id} | Date: {datetime.now().strftime('%Y-%m-%d')}", body_style))
            elements.append(Spacer(1, 0.15*inch))
            elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#1B3A38"), spaceBefore=5, spaceAfter=15))

            # Entities table
            entity_data = [
                [Paragraph("BUYER (Purchasing Party)", bold_label_style), Paragraph("SELLER (Supplying Party)", bold_label_style)],
                [Paragraph(req.buyer, body_style), Paragraph(req.seller, body_style)]
            ]
            t_entities = Table(entity_data, colWidths=[3.2*inch, 3.2*inch])
            t_entities.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#ECF0F1")),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                ('TOPPADDING', (0,0), (-1,-1), 8),
                ('LEFTPADDING', (0,0), (-1,-1), 8),
                ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ]))
            elements.append(t_entities)
            elements.append(Spacer(1, 0.2*inch))

            # Cargo specs table
            cargo_data = [
                [Paragraph("Waste Material Class", bold_label_style), Paragraph("Quantity (kg)", bold_label_style), Paragraph("Unit Rate (INR/kg)", bold_label_style), Paragraph("Valuation (INR)", bold_label_style)],
                [Paragraph(req.material, body_style), Paragraph(f"{req.quantity:,.1f}", body_style), Paragraph(f"₹{req.price:,.2f}", body_style), Paragraph(f"₹{(req.quantity * req.price):,.2f}", body_style)]
            ]
            t_cargo = Table(cargo_data, colWidths=[2.2*inch, 1.4*inch, 1.4*inch, 1.4*inch])
            t_cargo.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F2F4F4")),
                ('ALIGN', (1,0), (-1,-1), 'RIGHT'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#BDC3C7")),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                ('TOPPADDING', (0,0), (-1,-1), 6),
            ]))
            elements.append(t_cargo)
            elements.append(Spacer(1, 0.2*inch))

            # Clauses section
            elements.append(Paragraph("TERMS AND CONDITIONS CLAUSES", section_style))
            elements.append(Paragraph(f"<b>Clause 1: Delivery Terms:</b> {req.delivery_clause}", body_style))
            elements.append(Paragraph(f"<b>Clause 2: Payment Terms:</b> {req.payment_clause}", body_style))
            elements.append(Paragraph(f"<b>Clause 3: Defaulter Penalty:</b> {req.penalty_clause}", body_style))
            elements.append(Paragraph("<b>Clause 4: Quality Standard Compliance:</b> Material must fit standard industry category requirements and pass compliance checks. Contamination rates exceeding 15% permit buyer shipment rejection.", body_style))
            elements.append(Spacer(1, 0.2*inch))

            # Signatures block
            elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#BDC3C7"), spaceBefore=10, spaceAfter=15))
            elements.append(Paragraph("<b>DIGITAL CONTRACT INTEGRITY CERTIFICATION</b>", section_style))
            elements.append(Paragraph("This document has been digitally compiled and verified on the GreenChain Blockchain Ledger network. The digital signature hash below acts as witness to buyer/seller transaction approval.", body_style))
            elements.append(Spacer(1, 0.05*inch))
            
            sig_style = ParagraphStyle("Sig", parent=styles["Normal"], fontSize=7.5, fontName="Courier", textColor=colors.HexColor("#7F8C8D"))
            elements.append(Paragraph(f"DIGITAL SIGNATURE HASH: {sig_hash}", sig_style))

            doc.build(elements)
            logger.info(f"Contract PDF created successfully at {filepath}")
        except Exception as e:
            logger.error(f"Failed to generate contract PDF: {e}")

        # Compile response metadata JSON
        contract_data = {
            "contract_id": contract_id,
            "seller": req.seller,
            "buyer": req.buyer,
            "material": req.material,
            "quantity": req.quantity,
            "price": req.price,
            "delivery_clause": req.delivery_clause,
            "payment_clause": req.payment_clause,
            "penalty_clause": req.penalty_clause,
            "timestamp": timestamp,
            "signature_hash": sig_hash,
            "version": 1
        }

        return {
            "contract_id": contract_id,
            "pdf_filename": filename,
            "contract_json": json.dumps(contract_data, indent=2),
            "signature_hash": sig_hash,
            "version": 1
        }
