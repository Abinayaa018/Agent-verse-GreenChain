"""Loads waste_industry_mappings.json and exposes KB lookup functions."""

import json
import os
from typing import Callable, Optional

from .models import IndustryMatch

_MAPPINGS_PATH = os.path.join(os.path.dirname(__file__), "knowledge", "waste_industry_mappings.json")


class KnowledgeBase:
    def __init__(self, external_lookup: Optional[Callable[[str], list[dict]]] = None):
        self._external_lookup = external_lookup
        self._index: dict[str, list[IndustryMatch]] = {}
        self._category_index: dict[str, list[IndustryMatch]] = {}
        self._load()

    def _load(self) -> None:
        with open(_MAPPINGS_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        for entry in data["mappings"]:
            match = IndustryMatch(
                material_keyword=entry["material_keyword"],
                industry_name=entry["industry_name"],
                industry_code=entry["industry_code"],
                reuse_pathway=entry["reuse_pathway"],
                example_companies=entry.get("example_companies", []),
                estimated_value_per_unit=entry.get("estimated_value_per_unit"),
                typical_value_note=entry.get("typical_value_note", ""),
                risk_or_caveat=entry.get("risk_or_caveat"),
                sources=entry.get("sources", []),
                grounded=entry.get("grounded", False),
                demand_signal=entry.get("demand_signal", 5.0),
                confidence=entry.get("confidence", 5.0),
            )
            key = entry["material_keyword"].lower()
            self._index.setdefault(key, []).append(match)
            for cat in entry.get("compatible_categories", []):
                self._category_index.setdefault(cat.lower(), []).append(match)

    def find_similar_materials(self, material_name: str) -> list[IndustryMatch]:
        """Keyword + external_lookup retrieval — replaced by SemanticMatcher when available."""
        name_lower = material_name.lower()
        seen: set[str] = set()
        results: list[IndustryMatch] = []

        for keyword, entries in self._index.items():
            if keyword in name_lower or name_lower in keyword:
                for e in entries:
                    if e.industry_name not in seen:
                        results.append(e)
                        seen.add(e.industry_name)

        if self._external_lookup:
            for raw in self._external_lookup(material_name):
                m = IndustryMatch(**raw)
                if m.industry_name not in seen:
                    results.append(m)
                    seen.add(m.industry_name)

        return results

    def identify_compatible_industries(self, material_category: str) -> list[IndustryMatch]:
        """Return all KB entries compatible with a given material category."""
        return list(self._category_index.get(material_category.lower(), []))

    def all_entries(self) -> list[IndustryMatch]:
        return [m for entries in self._index.values() for m in entries]


# Module-level default instance (no external_lookup)
_default_kb = KnowledgeBase()


def find_similar_materials(material_name: str) -> list[IndustryMatch]:
    return _default_kb.find_similar_materials(material_name)


def identify_compatible_industries(material_category: str) -> list[IndustryMatch]:
    return _default_kb.identify_compatible_industries(material_category)


# Legacy alias used by older call sites
def find_matches(material_name: str) -> list[IndustryMatch]:
    return _default_kb.find_similar_materials(material_name)
