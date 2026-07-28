"""FastAPI router — POST /match, GET /health."""

from fastapi import APIRouter, HTTPException
from .models import WasteProfile, ResourceMatchResponse
from .agent import ResourceMatchingAgent

router = APIRouter(prefix="/agents/resource-matching", tags=["resource-matching"])

_agent = ResourceMatchingAgent()


@router.get("/health")
def health():
    return {"status": "ok", "agent": "resource_matching"}


@router.post("/match", response_model=ResourceMatchResponse)
def match(profile: WasteProfile) -> ResourceMatchResponse:
    try:
        return _agent.run(profile)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
