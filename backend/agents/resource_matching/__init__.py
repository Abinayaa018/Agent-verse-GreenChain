# Resource matching logic lives in agents/resource_matching/.
# This backend stub re-exports from there for any backend API layer that needs it.
from agents.resource_matching import (  # noqa: F401
    WasteProfile, SourceLocation,
    IndustryMatch, ScoreBreakdown, MatchResult,
    ResourceMatchRequest, ResourceMatchResponse,
    ResourceMatchingAgent, ClaudeGroundingClient, LLMGroundingClient,
    create_agent,
)
