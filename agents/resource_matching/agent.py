"""Resource Matching Agent — orchestrates the full matching pipeline."""

from __future__ import annotations
import json
import os
from typing import Protocol, runtime_checkable

from uagents import Agent, Context

from .models import WasteProfile, IndustryMatch, ResourceMatchRequest, ResourceMatchResponse
from .knowledge_base import KnowledgeBase, _default_kb
from .matcher import find_similar_materials, identify_compatible_industries, rank_matches
from .validator import RuleBasedValidator, LiveValidationClient
from .persuasion import TemplatePersuasionEngine, PersuasionClient

_GROUNDING_PROMPT_PATH = os.path.join(
    os.path.dirname(__file__), "prompts", "grounding_system_prompt.txt"
)


# ── LLM grounding protocol ────────────────────────────────────────────────────

@runtime_checkable
class LLMGroundingClient(Protocol):
    def generate_and_ground_pathways(
        self, profile: WasteProfile, existing: list[IndustryMatch]
    ) -> list[dict]: ...


class ClaudeGroundingClient:
    def __init__(self, api_key: str | None = None, model: str = "claude-sonnet-4-5"):
        from anthropic import Anthropic
        self._client = Anthropic(api_key=api_key)
        self._model = model
        with open(_GROUNDING_PROMPT_PATH, "r", encoding="utf-8") as f:
            self._system_prompt = f.read()

    def generate_and_ground_pathways(
        self, profile: WasteProfile, existing: list[IndustryMatch]
    ) -> list[dict]:
        existing_names = [m.industry_name for m in existing]
        response = self._client.messages.create(
            model=self._model,
            max_tokens=2000,
            system=self._system_prompt,
            tools=[{"type": "web_search_20250305", "name": "web_search"}],
            messages=[{
                "role": "user",
                "content": json.dumps({
                    "waste_profile": profile.model_dump(),
                    "existing_matches": existing_names,
                }),
            }],
        )
        text = "".join(b.text for b in response.content if b.type == "text")
        raw = json.loads(text.strip())
        return raw if isinstance(raw, list) else []


# ── Core pipeline ─────────────────────────────────────────────────────────────

class ResourceMatchingAgent:
    def __init__(
        self,
        llm_client: LLMGroundingClient | None = None,
        validation_client: LiveValidationClient | None = None,
        persuasion_client: PersuasionClient | None = None,
        kb: KnowledgeBase = _default_kb,
    ):
        self.llm_client = llm_client
        self._kb = kb
        self._rule_validator = RuleBasedValidator()
        self._validation_client = validation_client
        self._persuasion = persuasion_client or TemplatePersuasionEngine()

    def validate_input(self, profile: WasteProfile) -> WasteProfile:
        valid_categories = {
            "organic", "metal", "plastic", "chemical", "textile",
            "construction", "e_waste", "paper_pulp", "glass", "rubber", "other",
        }
        valid_forms = {"solid", "liquid", "sludge", "granulate", "powder", "gas", "offcut"}
        valid_frequencies = {"one_off", "weekly", "monthly", "continuous"}
        valid_hazards = {"none", "low", "moderate", "high", "regulated"}

        if profile.material_category not in valid_categories:
            raise ValueError(f"Invalid material_category: {profile.material_category}")
        if profile.physical_form not in valid_forms:
            raise ValueError(f"Invalid physical_form: {profile.physical_form}")
        if profile.frequency not in valid_frequencies:
            raise ValueError(f"Invalid frequency: {profile.frequency}")
        if profile.hazard_class not in valid_hazards:
            raise ValueError(f"Invalid hazard_class: {profile.hazard_class}")
        if profile.quantity_value <= 0:
            raise ValueError("quantity_value must be positive")
        return profile

    def run(self, profile: WasteProfile) -> ResourceMatchResponse:
        # 1. Validate input
        profile = self.validate_input(profile)

        # 2. Find similar materials from KB
        similar = find_similar_materials(profile, self._kb)

        # 3. Broaden with category-compatible industries
        candidates = identify_compatible_industries(profile, self._kb, existing=similar)

        # 4. LLM grounding — extend with live-searched candidates
        if self.llm_client:
            for c in self.llm_client.generate_and_ground_pathways(profile, candidates):
                m = IndustryMatch(
                    material_keyword=c.get("material_keyword", profile.material_name),
                    industry_name=c["industry_name"],
                    industry_code=c.get("industry_code", ""),
                    reuse_pathway=c.get("reuse_pathway", ""),
                    example_companies=c.get("example_companies", []),
                    estimated_value_per_unit=c.get("estimated_value_per_unit"),
                    typical_value_note=c.get("typical_value_note", ""),
                    risk_or_caveat=c.get("risk_note"),
                    sources=c.get("sources", []),
                    grounded=c.get("grounded", True),
                    demand_signal=float(c.get("demand_signal", 5.0)),
                    confidence=float(c.get("confidence", 5.0)),
                )
                if m.industry_name not in {x.industry_name for x in candidates}:
                    candidates.append(m)

        # 5. Filter exclusions
        candidates = [c for c in candidates if c.industry_name not in profile.exclusions]

        # 6. Rank matches
        results = rank_matches(profile, candidates)

        # 7. Rule-based validation (always runs)
        results = self._rule_validator.validate_all(results)

        # 8. Optional live re-validation of top candidates
        if self._validation_client:
            results = self._validation_client.revalidate(results, top_n=3)

        # 9. Generate pitch summaries
        results = self._persuasion.generate_all(results)

        return ResourceMatchResponse(
            results=results,
            material_name=profile.material_name,
            total_found=len(results),
        )


# ── uAgents wrapper ───────────────────────────────────────────────────────────

def create_agent(
    name: str = "resource_matching",
    seed: str | None = None,
    endpoint: str | None = None,
    llm_client: LLMGroundingClient | None = None,
    validation_client: LiveValidationClient | None = None,
    persuasion_client: PersuasionClient | None = None,
) -> Agent:
    agent = Agent(name=name, seed=seed, endpoint=endpoint)
    matcher = ResourceMatchingAgent(
        llm_client=llm_client,
        validation_client=validation_client,
        persuasion_client=persuasion_client,
    )

    @agent.on_message(model=ResourceMatchRequest)
    async def handle_match_request(ctx: Context, sender: str, msg: ResourceMatchRequest):
        ctx.logger.info(f"Resource match request from {sender} for: {msg.profile.material_name}")
        response = matcher.run(msg.profile)
        await ctx.send(sender, response)

    return agent


if __name__ == "__main__":
    agent = create_agent(llm_client=ClaudeGroundingClient())
    agent.run()
