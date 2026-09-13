from datetime import datetime, timezone

from fastapi import HTTPException

from app.config.database import db
from app.schemas.research_profile import (
    ResearchProfileCreate,
    ResearchProfileUpdate,
)


research_profiles_collection = db["research_profiles"]


def serialize_profile(profile):
    return {
        "id": str(profile["_id"]),
        "user_id": profile["user_id"],
        "organization": profile.get("organization"),
        "department": profile.get("department"),
        "designation": profile.get("designation"),
        "country": profile.get("country"),
        "research_domains": profile.get("research_domains", []),
        "keywords": profile.get("keywords", []),
        "technology_areas": profile.get("technology_areas", []),
        "created_at": profile["created_at"].isoformat(),
        "updated_at": profile["updated_at"].isoformat(),
    }


# CREATE
def create_research_profile(
    user_id: str,
    data: ResearchProfileCreate
):
    existing_profile = research_profiles_collection.find_one(
        {"user_id": user_id}
    )

    if existing_profile:
        raise HTTPException(
            status_code=409,
            detail="Research profile already exists for this user"
        )

    now = datetime.now(timezone.utc)

    profile = {
        "user_id": user_id,
        "organization": data.organization,
        "department": data.department,
        "designation": data.designation,
        "country": data.country,
        "research_domains": data.research_domains,
        "keywords": data.keywords,
        "technology_areas": data.technology_areas,
        "created_at": now,
        "updated_at": now,
    }

    result = research_profiles_collection.insert_one(profile)

    created_profile = research_profiles_collection.find_one(
        {"_id": result.inserted_id}
    )

    return serialize_profile(created_profile)


# GET ALL
def get_research_profiles():
    profiles = []

    cursor = research_profiles_collection.find({})

    for profile in cursor:
        profiles.append(serialize_profile(profile))

    return profiles


# GET BY USER ID
def get_research_profile_by_user_id(user_id: str):

    profile = research_profiles_collection.find_one(
        {"user_id": user_id}
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Research profile not found for this user"
        )

    return serialize_profile(profile)


# UPDATE BY USER ID
def update_research_profile(
    user_id: str,
    data: ResearchProfileUpdate
):

    update_data = data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update"
        )

    update_data["updated_at"] = datetime.now(timezone.utc)

    result = research_profiles_collection.update_one(
        {"user_id": user_id},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Research profile not found for this user"
        )

    updated_profile = research_profiles_collection.find_one(
        {"user_id": user_id}
    )

    return serialize_profile(updated_profile)


# DELETE BY USER ID
def delete_research_profile(user_id: str):

    result = research_profiles_collection.delete_one(
        {"user_id": user_id}
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Research profile not found for this user"
        )

    return {
        "message": "Research profile deleted successfully"
    }