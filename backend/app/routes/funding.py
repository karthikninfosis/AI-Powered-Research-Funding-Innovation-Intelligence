from fastapi import APIRouter, HTTPException

from app.schemas.funding import FundingRecommendationRequest
from app.services.funding_recommender import recommend_grants


router = APIRouter(
    prefix="/funding",
    tags=["Funding"]
)


@router.post("/recommend")
def recommend_funding(
    request: FundingRecommendationRequest
):

    try:

        # Combine title + description
        innovation_text = ""

        if request.innovation_title:
            innovation_text += (
                request.innovation_title + ". "
            )

        innovation_text += request.innovation_description

        # Get recommendations
        recommendations = recommend_grants(
            innovation_description=innovation_text,
            top_k=request.top_k
        )

        return {
            "success": True,
            "count": len(recommendations),
            "recommendations": recommendations
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )