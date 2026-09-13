from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.patent import PatentResponse


class PatentSearchResponse(BaseModel):
    query: Optional[str] = None
    total: int
    limit: int
    skip: int
    results: list[PatentResponse]


class PatentClusterRequest(BaseModel):
    k: int = Field(..., gt=0, description="Number of technology clusters")


class PatentCluster(BaseModel):
    cluster_id: int
    size: int
    representative_terms: list[str]
    patents: list[PatentResponse]


class PatentClusterResponse(BaseModel):
    clusters: list[PatentCluster]


class YearTrend(BaseModel):
    year: int
    count: int


class DomainTrend(BaseModel):
    technology_domain: str
    count: int


class YearlyGrowth(YearTrend):
    growth_percent: Optional[float] = None


class PatentTrendResponse(BaseModel):
    by_year: list[YearTrend]
    by_domain: list[DomainTrend]
    yearly_growth: list[YearlyGrowth]


class CompetitorResponse(BaseModel):
    assignee: str
    patent_count: int
    citation_count: int
    technology_domains: list[str]


class CompetitorAnalysisResponse(BaseModel):
    competitors: list[CompetitorResponse]


class InnovationMapItem(BaseModel):
    technology_domain: str
    patent_count: int
    top_assignees: list[str]
    top_classifications: list[str]


class InnovationMapResponse(BaseModel):
    technology_map: list[InnovationMapItem]
