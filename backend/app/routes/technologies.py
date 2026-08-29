from fastapi import APIRouter, HTTPException

from app.schemas.technology import (
    TechnologyCreate,
    TechnologyUpdate,
    TechnologyResponse
)

from app.services.technology_service import (
    create_technology,
    get_technologies,
    get_technology,
    update_technology,
    delete_technology,
    get_maturity,
    get_adoption,
    get_opportunities
)


router = APIRouter(
    prefix="/api/technologies",
    tags=["Technology Intelligence"]
)


# =========================================================
# GET ALL
# =========================================================

@router.get(
    "",
    response_model=list[TechnologyResponse]
)
def get_all_technologies():

    return get_technologies()


# =========================================================
# CREATE
# =========================================================

@router.post(
    "",
    response_model=TechnologyResponse,
    status_code=201
)
def create_new_technology(
    data: TechnologyCreate
):

    return create_technology(data)


# =========================================================
# GET OPPORTUNITIES
# IMPORTANT: This route must come before /{technology_id}
# =========================================================

@router.get(
    "/opportunities"
)
def technology_opportunities():

    return get_opportunities()


# =========================================================
# GET MATURITY
# =========================================================

@router.get(
    "/{technology_id}/maturity"
)
def technology_maturity(
    technology_id: str
):

    result = get_maturity(
        technology_id
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Technology not found"
        )

    return result


# =========================================================
# GET ADOPTION
# =========================================================

@router.get(
    "/{technology_id}/adoption"
)
def technology_adoption(
    technology_id: str
):

    result = get_adoption(
        technology_id
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Technology not found"
        )

    return result


# =========================================================
# GET BY ID
# =========================================================

@router.get(
    "/{technology_id}",
    response_model=TechnologyResponse
)
def get_technology_by_id(
    technology_id: str
):

    technology = get_technology(
        technology_id
    )

    if not technology:

        raise HTTPException(
            status_code=404,
            detail="Technology not found"
        )

    return technology


# =========================================================
# UPDATE
# =========================================================

@router.put(
    "/{technology_id}",
    response_model=TechnologyResponse
)
def update_existing_technology(
    technology_id: str,
    data: TechnologyUpdate
):

    technology = update_technology(
        technology_id,
        data
    )

    if not technology:

        raise HTTPException(
            status_code=404,
            detail="Technology not found"
        )

    return technology


# =========================================================
# DELETE
# =========================================================

@router.delete(
    "/{technology_id}"
)
def delete_existing_technology(
    technology_id: str
):

    deleted = delete_technology(
        technology_id
    )

    if not deleted:

        raise HTTPException(
            status_code=404,
            detail="Technology not found"
        )

    return {
        "message": "Technology deleted successfully"
    }