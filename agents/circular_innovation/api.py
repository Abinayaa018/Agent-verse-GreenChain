"""FastAPI REST API router for the Circular Innovation Agent."""

import logging
from fastapi import APIRouter, HTTPException, Query
from .models import CircularInnovationRequest, CircularInnovationResponse, WasteProfileInput
from .rules import CircularInnovationEngine

logger = logging.getLogger("circular_innovation.api")

router = APIRouter(prefix="/api/v1/circular_innovation", tags=["Circular Innovation"])

# Shared engine instance
_engine = CircularInnovationEngine()


@router.get("/health", summary="Health check")
def health_check():
    """Health check endpoint for Circular Innovation Agent service."""
    return {
        "status": "healthy",
        "agent": "Circular Innovation Agent",
        "version": "1.0.0",
        "discovery_type": "UNMATCHED_CIRCULAR_REUSE_DISCOVERY"
    }


@router.post("/innovate", response_model=CircularInnovationResponse, summary="Discover reuse opportunities")
def discover_reuse_opportunities(request: CircularInnovationRequest):
    """Execute evidence-backed circular reuse discovery for unmatched waste profile."""
    try:
        response = _engine.discover_innovations(request)
        return response
    except Exception as e:
        logger.error(f"Error processing innovation request: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/graph/stats", summary="Knowledge Graph statistics")
def get_graph_stats():
    """Retrieve node and edge statistics for the Circular Knowledge Graph."""
    return _engine.knowledge_graph.get_graph_stats()
