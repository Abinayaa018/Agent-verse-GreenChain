"""Persuasion layer — generates pitch_summary for each MatchResult."""

from __future__ import annotations
import json
import os
from typing import Protocol, runtime_checkable

from .models import MatchResult

_PERSUASION_PROMPT_PATH = os.path.join(
    os.path.dirname(__file__), "prompts", "persuasion_system_prompt.txt"
)


# ── Template engine (deterministic, no API key needed) ───────────────────────

class TemplatePersuasionEngine:
    def generate(self, result: MatchResult) -> MatchResult:
        m = result.match
        s = result.score

        value_clause = (
            f"at an estimated value of ${m.estimated_value_per_unit}/unit"
            if m.estimated_value_per_unit
            else "potentially offsetting disposal costs"
        )
        caveat_clause = f" Note: {m.risk_or_caveat}" if m.risk_or_caveat else ""
        flag_clause = (
            f" {len(result.validation_flags)} validation flag(s) require review."
            if result.validation_flags else ""
        )

        pitch = (
            f"{m.industry_name} can absorb your {m.material_keyword} via {m.reuse_pathway.rstrip('.')} "
            f"({value_clause}, match score {s.weighted_total:.2f}/10).{caveat_clause}{flag_clause}"
        )
        return result.model_copy(update={"pitch_summary": pitch})

    def generate_all(self, results: list[MatchResult]) -> list[MatchResult]:
        return [self.generate(r) for r in results]


# ── LLM persuasion client protocol ───────────────────────────────────────────

@runtime_checkable
class PersuasionClient(Protocol):
    def generate(self, result: MatchResult) -> MatchResult: ...
    def generate_all(self, results: list[MatchResult]) -> list[MatchResult]: ...


class ClaudePersuasionClient:
    def __init__(self, api_key: str | None = None, model: str = "claude-sonnet-4-5"):
        from anthropic import Anthropic
        self._client = Anthropic(api_key=api_key)
        self._model = model
        with open(_PERSUASION_PROMPT_PATH, "r", encoding="utf-8") as f:
            self._system_prompt = f.read()

    def generate(self, result: MatchResult) -> MatchResult:
        payload = {
            "industry_name": result.match.industry_name,
            "reuse_pathway": result.match.reuse_pathway,
            "estimated_value_per_unit": result.match.estimated_value_per_unit,
            "typical_value_note": result.match.typical_value_note,
            "risk_or_caveat": result.match.risk_or_caveat,
            "weighted_total": result.score.weighted_total,
            "validation_flags": [f.model_dump() for f in result.validation_flags],
        }
        response = self._client.messages.create(
            model=self._model,
            max_tokens=300,
            system=self._system_prompt,
            messages=[{"role": "user", "content": json.dumps(payload)}],
        )
        text = "".join(b.text for b in response.content if b.type == "text")
        try:
            data = json.loads(text.strip())
            return result.model_copy(update={"pitch_summary": data.get("pitch_summary", "")})
        except json.JSONDecodeError:
            return result

    def generate_all(self, results: list[MatchResult]) -> list[MatchResult]:
        return [self.generate(r) for r in results]
