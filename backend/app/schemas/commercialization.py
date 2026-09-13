from pydantic import BaseModel, Field
from typing import List, Optional


class CommercializationRequest(BaseModel):
    user_id: str
    title: str
    abstract: str
    technology: Optional[str] = None
    domain: Optional[str] = None


class CommercializationRecommendation(BaseModel):
    technology: str
    commercialization_path: str
    target_market: str
    recommendation_score: float
    reason: str


class CommercializationResponse(BaseModel):
    success: bool
    user_id: str
    recommendations: List[CommercializationRecommendation]