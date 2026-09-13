from fastapi import APIRouter, HTTPException

from app.schemas.commercialization import (
    CommercializationRequest,
    CommercializationResponse
)

from app.services.commercialization_service import (
    generate_recommendations
)


router = APIRouter(
    prefix="/api/commercialization",
    tags=["Commercialization"]
)


# Temporary in-memory storage
# Later we can replace this with MongoDB/PostgreSQL.
commercialization_db = {}


@router.post(
    "/recommendations",
    response_model=CommercializationResponse
)
async def create_recommendations(
    request: CommercializationRequest
):

    try:

        recommendations = generate_recommendations(
            title=request.title,
            abstract=request.abstract,
            technology=request.technology,
            domain=request.domain
        )

        result = {
            "success": True,
            "user_id": request.user_id,
            "recommendations": recommendations
        }

        # Store recommendations for the user
        commercialization_db[request.user_id] = result

        return result

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate recommendations: {str(e)}"
        )


@router.get(
    "/recommendations/{user_id}",
    response_model=CommercializationResponse
)
async def get_recommendations(user_id: str):

    result = commercialization_db.get(user_id)

    if not result:

        raise HTTPException(
            status_code=404,
            detail="No commercialization recommendations found for this user"
        )

    return result