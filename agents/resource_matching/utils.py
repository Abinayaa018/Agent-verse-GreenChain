"""Distance calculation, scoring helpers, and logging."""

from __future__ import annotations
import logging
import math

logger = logging.getLogger("resource_matching")


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in km between two lat/lon points."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def safe_ratio_score(value: float | None, disposal_cost: float | None, scale: float = 10.0) -> float:
    """Map estimated_value / disposal_cost to a 0-10 economic_value score."""
    if not value or not disposal_cost:
        return 5.0
    return min((value / disposal_cost) / 3.0 * scale, scale)


def hazard_penalty(hazard_class: str) -> float:
    """Regulatory ease score (0-10): higher = easier to handle."""
    return {"none": 10.0, "low": 8.0, "moderate": 6.0, "high": 2.0, "regulated": 1.0}.get(hazard_class, 5.0)


def purity_fit_score(purity_pct: float | None) -> float:
    """Technical fit proxy from purity percentage (0-10)."""
    if purity_pct is None:
        return 5.0
    return min(purity_pct / 10.0, 10.0)
