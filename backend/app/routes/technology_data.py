from fastapi import APIRouter, Query, HTTPException
from app.services.datasets_service import get_dataset_count, search_dataset

router = APIRouter(
    prefix="/api/technology-data",
    tags=["Technology Dataset"]
)


# GET /api/technology-data/count
@router.get("/count")
def technology_count():
    try:
        total = get_dataset_count("technology")

        return {
            "dataset": "technology_dataset.csv",
            "total_records": total
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# GET /api/technology-data/search
@router.get("/search")
def search_technology_data(
    search: str | None = Query(default=None)
):
    try:
        result = search_dataset(
            dataset="technology",
            search=search,
            page=1,
            page_size=100
        )

        return {
            "dataset": "technology_dataset.csv",
            "total_records": result["total_matches"],
            "records": result["records"]
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )