from fastapi import APIRouter, HTTPException

from app.schemas.innovation_score import InnovationScoreCreate
from app.services.innovation_score_service import InnovationScoreService


router = APIRouter(
    prefix="/api/innovation-scores",
    tags=["Innovation Scores"]
)


@router.post("")
async def create_innovation_score(data: InnovationScoreCreate):
    try:
        result = await InnovationScoreService.create_innovation_score(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{score_id}")
async def get_innovation_score(score_id: str):

    result = await InnovationScoreService.get_innovation_score(score_id)

    if not result:
        raise HTTPException(404, "Innovation score not found")

    return result