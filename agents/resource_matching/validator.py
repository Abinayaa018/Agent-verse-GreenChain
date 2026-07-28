"""Validation layer — rule-based (always runs) + optional live re-check."""

from __future__ import annotations
import json
import os
from typing import Protocol, runtime_checkable

from .models import MatchResult, ValidationFlag

_VALIDATION_PROMPT_PATH = os.path.join(
    os.path.dirname(__file__), "prompts", "validation_system_prompt.txt"
)


# ── Rule-based validator (no network, runs on every request) ─────────────────

class RuleBasedValidator:
    def validate(self, result: MatchResult) -> MatchResult:
        flags: list[ValidationFlag] = list(result.validation_flags)

        m = result.match

        if m.grounded and not m.sources:
            flags.append(ValidationFlag(
                code="GROUNDED_NO_SOURCES",
                message="Match is marked grounded but has no source URLs.",
                severity="error",
            ))

        if m.estimated_value_per_unit is not None and m.estimated_value_per_unit > 10_000:
            flags.append(ValidationFlag(
                code="VALUE_OUTLIER",
                message=f"Estimated value {m.estimated_value_per_unit} is unusually high — verify.",
                severity="warning",
            ))

        if m.risk_or_caveat is None and result.score.regulatory_ease < 4.0:
            flags.append(ValidationFlag(
                code="MISSING_HAZARD_CAVEAT",
                message="Low regulatory ease score but no risk caveat provided.",
                severity="warning",
            ))

        if m.grounded and m.confidence < 3.0:
            flags.append(ValidationFlag(
                code="LOW_CONFIDENCE_GROUNDED",
                message="Grounded match has very low confidence — treat as unverified.",
                severity="warning",
            ))

        return result.model_copy(update={"validation_flags": flags})

    def validate_all(self, results: list[MatchResult]) -> list[MatchResult]:
        return [self.validate(r) for r in results]


# ── Live validation client protocol ──────────────────────────────────────────

@runtime_checkable
class LiveValidationClient(Protocol):
    def revalidate(self, results: list[MatchResult], top_n: int) -> list[MatchResult]: ...


class ClaudeLiveValidator:
    """Independent live re-check of the top-N grounded candidates."""

    def __init__(self, api_key: str | None = None, model: str = "claude-sonnet-4-5"):
        from anthropic import Anthropic
        self._client = Anthropic(api_key=api_key)
        self._model = model
        with open(_VALIDATION_PROMPT_PATH, "r", encoding="utf-8") as f:
            self._system_prompt = f.read()

    def revalidate(self, results: list[MatchResult], top_n: int = 3) -> list[MatchResult]:
        grounded = [r for r in results if r.match.grounded][:top_n]
        if not grounded:
            return results

        payload = [
            {
                "industry_name": r.match.industry_name,
                "reuse_pathway": r.match.reuse_pathway,
                "sources": r.match.sources,
                "estimated_value_per_unit": r.match.estimated_value_per_unit,
            }
            for r in grounded
        ]

        response = self._client.messages.create(
            model=self._model,
            max_tokens=1500,
            system=self._system_prompt,
            tools=[{"type": "web_search_20250305", "name": "web_search"}],
            messages=[{"role": "user", "content": json.dumps(payload)}],
        )
        text = "".join(b.text for b in response.content if b.type == "text")
        try:
            feedback: list[dict] = json.loads(text.strip())
        except json.JSONDecodeError:
            return results

        feedback_map = {f["industry_name"]: f for f in feedback}
        updated: list[MatchResult] = []
        for r in results:
            fb = feedback_map.get(r.match.industry_name)
            if fb:
                flags = list(r.validation_flags)
                if not fb.get("confirmed", True):
                    flags.append(ValidationFlag(
                        code="LIVE_RECHECK_FAILED",
                        message=fb.get("reason", "Live re-check could not confirm this pathway."),
                        severity="warning",
                    ))
                updated.append(r.model_copy(update={"validation_flags": flags}))
            else:
                updated.append(r)
        return updated
