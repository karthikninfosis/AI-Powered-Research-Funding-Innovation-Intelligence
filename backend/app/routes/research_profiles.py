from fastapi import APIRouter

from app.schemas.research_profile import (
    ResearchProfileCreate,
    ResearchProfileUpdate,
)

from app.services.research_profile_service import (
    create_research_profile,
    get_research_profiles,
    get_research_profile_by_user_id,
    update_research_profile,
    delete_research_profile,
)


router = APIRouter(
    prefix="/api/research-profiles",
    tags=["Research Profiles"]
)


# POST
@router.post("")
def create_profile(data: ResearchProfileCreate):

    return create_research_profile(
        user_id=data.user_id,
        data=data
    )


# GET ALL
@router.get("")
def get_profiles():

    return get_research_profiles()


# GET BY USER ID
@router.get("/{user_id}")
def get_profile(user_id: str):

    return get_research_profile_by_user_id(
        user_id
    )


# UPDATE BY USER ID
@router.put("/{user_id}")
def update_profile(
    user_id: str,
    data: ResearchProfileUpdate
):

    return update_research_profile(
        user_id=user_id,
        data=data
    )


# DELETE BY USER ID
@router.delete("/{user_id}")
def delete_profile(user_id: str):

    return delete_research_profile(
        user_id
    )