from fastapi import APIRouter, Query, HTTPException

from app.services.datasets_service import (
    get_dataset_count,
    search_dataset
)


router = APIRouter(
    prefix="/api/grants-data",
    tags=["Grants Dataset"]
)


@router.get("/count")
def grants_count():

    try:
        total = get_dataset_count("grants")

        return {
            "dataset": "grants",
            "total_records": total
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.get("/search")
def search_grants(
    search: str | None = Query(
        default=None
    ),
    page: int = Query(
        default=1,
        ge=1
    ),
    page_size: int = Query(
        default=20,
        ge=1,
        le=100
    )
):

    try:
        return search_dataset(
            dataset="grants",
            search=search,
            page=page,
            page_size=page_size
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )