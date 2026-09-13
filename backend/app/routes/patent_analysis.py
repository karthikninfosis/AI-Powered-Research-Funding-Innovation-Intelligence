from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.middleware.auth import get_current_user
from app.schemas.patent_analysis import (
    CompetitorAnalysisResponse,
    InnovationMapResponse,
    PatentClusterRequest,
    PatentClusterResponse,
    PatentSearchResponse,
    PatentTrendResponse,
)
from app.services.patent_analysis_service import (
    InvalidClusterRequestError,
    get_clusters,
    get_competitors,
    get_innovation_map,
    get_trends,
    search_patents,
)


router = APIRouter(prefix="/api/patent-analysis", tags=["Patent Analysis"])


@router.get("/search", response_model=PatentSearchResponse)
def search(
    q: Optional[str] = None,
    technology_domain: Optional[str] = None,
    assignee: Optional[str] = None,
    status: Optional[str] = None,
    filing_year: Optional[int] = Query(default=None, ge=1, le=9999),
    limit: int = Query(default=20, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
    _: dict = Depends(get_current_user),
):
    return search_patents(q, technology_domain, assignee, status, filing_year, limit, skip)


@router.post("/clusters", response_model=PatentClusterResponse)
def clusters(data: PatentClusterRequest, _: dict = Depends(get_current_user)):
    try:
        return get_clusters(data.k)
    except InvalidClusterRequestError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/trends", response_model=PatentTrendResponse)
def trends(
    technology_domain: Optional[str] = None,
    assignee: Optional[str] = None,
    start_year: Optional[int] = Query(default=None, ge=1, le=9999),
    end_year: Optional[int] = Query(default=None, ge=1, le=9999),
    _: dict = Depends(get_current_user),
):
    if start_year is not None and end_year is not None and start_year > end_year:
        raise HTTPException(status_code=400, detail="start_year cannot be after end_year")
    return get_trends(technology_domain, assignee, start_year, end_year)


@router.get("/competitors", response_model=CompetitorAnalysisResponse)
def competitors(
    technology_domain: Optional[str] = None,
    _: dict = Depends(get_current_user),
):
    return get_competitors(technology_domain)


@router.get("/innovation-map", response_model=InnovationMapResponse)
def innovation_map(
    technology_domain: Optional[str] = None,
    _: dict = Depends(get_current_user),
):
    return get_innovation_map(technology_domain)
