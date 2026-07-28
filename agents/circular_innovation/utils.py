"""Utility helpers for logging, text cleaning, TRL mapping, and URL validation."""

import re
import logging
from typing import Dict

logger = logging.getLogger("circular_innovation")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")


TRL_DESCRIPTIONS: Dict[int, str] = {
    1: "Basic principles observed and reported",
    2: "Technology concept and/or application formulated",
    3: "Analytical and experimental critical function/characteristic proof of concept",
    4: "Component and/or breadboard validation in laboratory environment",
    5: "Component and/or breadboard validation in relevant environment",
    6: "System/subsystem model or prototype demonstration in relevant environment",
    7: "System prototype demonstration in an operational environment",
    8: "Actual system completed and qualified through test and demonstration",
    9: "Actual system proven in operational environment (competitive manufacturing)",
}


def clean_text(text: str) -> str:
    """Clean and normalize whitespace in text strings."""
    if not text:
        return ""
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def validate_url(url: str) -> bool:
    """Basic validation for source URLs."""
    if not url or not isinstance(url, str):
        return False
    return url.startswith("http://") or url.startswith("https://") or url.startswith("doi:") or url.startswith("10.")


def get_trl_description(trl: int) -> str:
    """Return human-readable TRL definition."""
    return TRL_DESCRIPTIONS.get(trl, "Unknown Technology Readiness Level")


def format_innovation_report(response) -> str:
    """Format CircularInnovationResponse model into a beautifully structured report with subheadings."""
    lines = []
    lines.append("=" * 80)
    lines.append("                GREENCHAIN AI - CIRCULAR INNOVATION DISCOVERY REPORT")
    lines.append("=" * 80)
    lines.append("")
    lines.append("## 1. Executive Summary")
    lines.append(f"  - Target Material     : {response.query_material}")
    lines.append(f"  - Material Category  : {response.material_category}")
    lines.append(f"  - Discovery Type     : {response.discovery_type}")
    lines.append(f"  - Discoveries Found  : {response.total_discoveries}")
    lines.append(f"  - Execution Timestamp: {response.execution_timestamp}")
    lines.append(f"  - Cache Status       : {response.cached}")
    lines.append(f"  - System Status       : {response.status}")
    lines.append("")
    lines.append("-" * 80)
    lines.append("## 2. Evidence-Backed Circular Innovation Discoveries")
    lines.append("-" * 80)

    for idx, disc in enumerate(response.discoveries, 1):
        lines.append("")
        lines.append(f"### Discovery #{idx} [{disc.innovation_id}]: {disc.discovery_title}")
        lines.append(f"  * Target Industry      : {disc.target_industry}")
        lines.append(f"  * Novelty Index        : {disc.novelty_index}")
        lines.append(f"  * Decarbonization      : {disc.decarbonization_impact}")
        lines.append(f"  * Technology Readiness : TRL {disc.trl_level} ({disc.trl_stage_description})")
        lines.append(f"  * Innovation Score     : {disc.innovation_score:.2f} / 100.00")
        lines.append(f"  * Evidence Confidence  : {disc.confidence_rating:.2f} / 100.00")
        lines.append("")
        lines.append("  #### Transformation & Reuse Pathway")
        lines.append(f"    {disc.transformation_pathway}")
        lines.append("")
        lines.append("  #### Technical Synthesis")
        lines.append(f"    {disc.technical_synthesis}")
        lines.append("")
        lines.append("  #### Industrial Benefits")
        for b in disc.industrial_benefits:
            lines.append(f"    • {b}")
        lines.append("")
        lines.append("  #### Environmental & Decarbonization Benefits")
        for eb in disc.environmental_benefits:
            lines.append(f"    • {eb}")
        lines.append("")
        lines.append("  #### Processing & Equipment Requirements")
        for pr in disc.processing_requirements:
            lines.append(f"    • {pr}")
        lines.append("")
        lines.append("  #### Technical Limitations & Constraints")
        for lim in disc.technical_limitations:
            lines.append(f"    • {lim}")

        if disc.supporting_literature:
            lines.append("")
            lines.append("  #### Supporting Scientific Literature")
            for p_idx, paper in enumerate(disc.supporting_literature, 1):
                authors_str = ", ".join(paper.authors) if paper.authors else "Unknown Authors"
                lines.append(f"    {p_idx}. \"{paper.title}\"")
                lines.append(f"       - Authors    : {authors_str} ({paper.year})")
                lines.append(f"       - Journal    : {paper.journal_or_publisher or 'Academic Journal'}")
                lines.append(f"       - Citations  : {paper.citation_count}")
                lines.append(f"       - Key Finding: {paper.key_finding}")
                lines.append(f"       - DOI / Link : {paper.doi_or_url}")

        if disc.supporting_patents:
            lines.append("")
            lines.append("  #### Supporting Patent Prior Art")
            for pat_idx, pat in enumerate(disc.supporting_patents, 1):
                lines.append(f"    {pat_idx}. Patent {pat.patent_number} - \"{pat.title}\"")
                lines.append(f"       - Assignee   : {pat.assignee} ({pat.year})")
                lines.append(f"       - Office     : {pat.patent_office}")
                lines.append(f"       - Claims     : {pat.claim_summary}")
                lines.append(f"       - Patent Link: {pat.url}")

        lines.append("")
        lines.append("  #### Verifiable Source URLs")
        for url in disc.verifiable_sources:
            lines.append(f"    - {url}")
        lines.append("-" * 80)

    return "\n".join(lines)

