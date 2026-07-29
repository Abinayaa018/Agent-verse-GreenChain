import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)

REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "reports")

RATING_COLORS = {
    "Platinum": colors.HexColor("#37474F"),
    "Gold": colors.HexColor("#B8860B"),
    "Silver": colors.HexColor("#757575"),
    "Emerging": colors.HexColor("#1B5E20"),
}


def generate_esg_report(company_name: str, summary: dict, history: list) -> str:
    os.makedirs(REPORTS_DIR, exist_ok=True)
    safe_name = company_name.replace(" ", "_")
    date_tag = datetime.now().strftime("%Y%m%d")
    filepath = os.path.join(REPORTS_DIR, f"Audit_Report_{safe_name}_{date_tag}.pdf")

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("Title", parent=styles["Title"], fontSize=21,
                                  textColor=colors.HexColor("#1B5E20"), spaceAfter=4)
    subtitle_style = ParagraphStyle("Subtitle", parent=styles["Normal"], fontSize=10,
                                     textColor=colors.HexColor("#555555"))
    section_style = ParagraphStyle("Section", parent=styles["Heading2"], fontSize=13,
                                    textColor=colors.HexColor("#1B5E20"), spaceBefore=18, spaceAfter=8)
    rating_style = ParagraphStyle("Rating", parent=styles["Normal"], fontSize=16,
                                   textColor=RATING_COLORS.get(summary["circularity_rating"], colors.black),
                                   spaceBefore=6, spaceAfter=10)

    doc = SimpleDocTemplate(filepath, pagesize=letter,
                             topMargin=0.6*inch, bottomMargin=0.6*inch,
                             leftMargin=0.7*inch, rightMargin=0.7*inch)
    story = []

    # ── Header ──
    story.append(Paragraph("GreenChain AI — Audit & ESG Sustainability Report", title_style))
    story.append(Paragraph(
        f"Company: <b>{company_name}</b> &nbsp;|&nbsp; "
        f"Generated: {datetime.now().strftime('%d %B %Y')} &nbsp;|&nbsp; "
        f"Reporting basis: All recorded GreenChain AI transactions to date", subtitle_style
    ))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#1B5E20"), spaceBefore=10, spaceAfter=14))

    # ── Circularity Rating (headline) ──
    story.append(Paragraph("Circularity Rating", section_style))
    story.append(Paragraph(f"● {summary['circularity_rating']}", rating_style))
    story.append(Paragraph(
        "Rating reflects total verified transaction volume and cumulative CO2e avoided "
        "through GreenChain AI's industrial resource exchange platform.",
        styles["Normal"]
    ))

    # ── Headline Metrics ──
    story.append(Paragraph("Environmental Impact Summary", section_style))
    metrics_data = [
        ["Metric", "Value"],
        ["Total Transactions Recorded", str(summary["total_transactions"])],
        ["Total CO2e Avoided", f"{summary['total_co2_saved_kg']:,} kg"],
        ["Total Landfill Diversion", f"{summary['total_landfill_diverted_kg']:,} kg"],
    ]
    metrics_table = Table(metrics_data, colWidths=[3*inch, 2.7*inch])
    metrics_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1B5E20")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#BDBDBD")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F1F8E9")]),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(metrics_table)

    # ── Material Breakdown ──
    story.append(Paragraph("Material Breakdown", section_style))
    if summary["material_breakdown"]:
        breakdown_rows = [["Material Type", "Total Quantity (kg)"]]
        for material, qty in sorted(summary["material_breakdown"].items(), key=lambda x: -x[1]):
            breakdown_rows.append([material.title(), f"{qty:,.1f}"])
        breakdown_table = Table(breakdown_rows, colWidths=[3*inch, 2.7*inch])
        breakdown_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2E7D32")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9.5),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#BDBDBD")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F1F8E9")]),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(breakdown_table)

    # ── Transaction Log ──
    story.append(Paragraph("Transaction Log (Most Recent)", section_style))
    log_rows = [["Contract ID", "Material", "Qty (kg)", "CO2e Saved (kg)", "Date"]]
    for e in history[-10:][::-1]:  # most recent first, capped at 10 rows
        log_rows.append([
            e["contract_id"], e["material_type"].title(),
            f"{e['quantity_kg']:.1f}", f"{e['co2_saved_kg']:.1f}",
            e["timestamp"].split("T")[0],
        ])
    log_table = Table(log_rows, colWidths=[1.3*inch, 1.1*inch, 1*inch, 1.3*inch, 1*inch])
    log_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1B5E20")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#BDBDBD")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F1F8E9")]),
        ("ALIGN", (2, 0), (-1, -1), "CENTER"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(log_table)

    # ── Footer / disclosure ──
    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#BDBDBD")))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "Methodology: CO2e avoided is calculated using material-specific emission factors "
        "referenced from EPA's Waste Reduction Model (WARM). This report reflects transactions "
        "recorded on the GreenChain AI platform only and is intended to support, not replace, "
        "formal ESG disclosure processes (e.g. BRSR, CSRD).",
        ParagraphStyle("Footer", parent=styles["Normal"], fontSize=7.5, textColor=colors.HexColor("#888888"))
    ))

    doc.build(story)
    return filepath