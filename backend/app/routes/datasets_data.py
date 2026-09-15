from fastapi import APIRouter, Query, HTTPException

from app.services.datasets_service import (
    get_dataset_count,
    search_dataset
)


router = APIRouter(
    prefix="/api/datasets-data",
    tags=["Datasets CSV"]
)


# =========================================================
# GET COUNT
# =========================================================

@router.get("/count")
def datasets_count():

    try:
        total = get_dataset_count("datasets")

        return {
            "dataset": "datasets.csv",
            "total_records": total
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =========================================================
# SEARCH / BROWSE
# =========================================================

@router.get("/search")
def search_datasets(
    search: str | None = Query(
        default=None,
        description="Search across all columns"
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
            dataset="datasets",
            search=search,
            page=page,
            page_size=page_size
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )