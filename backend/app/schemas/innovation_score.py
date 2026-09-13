from pydantic import BaseModel, Field
from typing import Optional


class InnovationScoreCreate(BaseModel):
    research_id: Optional[str] = None
    research_novelty: float = Field(..., ge=0, le=100)
    patent_strength: float = Field(..., ge=0, le=100)
    technology_maturity: float = Field(..., ge=0, le=100)
    market_potential: float = Field(..., ge=0, le=100)
    funding_relevance: float = Field(..., ge=0, le=100)


class InnovationScoreResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    research_id: Optional[str] = None
    scores: dict
    weights: dict
    innovation_score: float
    innovation_level: str
    created_at: str
    updated_at: str