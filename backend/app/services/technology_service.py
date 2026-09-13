from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId

from app.config.database import db

from app.models.technology import TechnologyModel

from app.ai.technology_intelligence import (
    analyze_maturity,
    analyze_adoption,
    analyze_opportunity
)


technologies_collection = db["technologies"]


# =========================================================
# Helper
# =========================================================

def serialize_technology(technology: dict) -> dict:

    return {
        "id": str(technology["_id"]),
        "name": technology["name"],
        "domain": technology["domain"],
        "description": technology["description"],

        "maturity": technology["maturity"],
        "adoption": technology["adoption"],

        "created_at": technology["created_at"],
        "updated_at": technology["updated_at"]
    }


# =========================================================
# CREATE
# =========================================================

def create_technology(data):

    maturity_score = (
        data.maturity.score
        if data.maturity
        else 0
    )

    adoption_score = (
        data.adoption.score
        if data.adoption
        else 0
    )

    maturity = analyze_maturity(
        maturity_score
    )

    adoption = analyze_adoption(
        adoption_score
    )

    document = TechnologyModel.create_document(
        name=data.name,
        domain=data.domain,
        description=data.description,

        maturity_level=maturity["level"],
        maturity_score=maturity["score"],

        adoption_level=adoption["level"],
        adoption_score=adoption["score"]
    )

    result = technologies_collection.insert_one(
        document
    )

    created = technologies_collection.find_one(
        {"_id": result.inserted_id}
    )

    return serialize_technology(created)


# =========================================================
# GET ALL
# =========================================================

def get_technologies():

    technologies = technologies_collection.find()

    return [
        serialize_technology(technology)
        for technology in technologies
    ]


# =========================================================
# GET BY ID
# =========================================================

def get_technology(technology_id: str):

    try:
        object_id = ObjectId(technology_id)

    except InvalidId:
        return None

    technology = technologies_collection.find_one(
        {"_id": object_id}
    )

    if not technology:
        return None

    return serialize_technology(technology)


# =========================================================
# UPDATE
# =========================================================

def update_technology(
    technology_id: str,
    data
):

    try:
        object_id = ObjectId(technology_id)

    except InvalidId:
        return None

    update_data = data.model_dump(
        exclude_unset=True
    )

    if not update_data:
        return get_technology(technology_id)

    # Recalculate maturity
    if "maturity" in update_data:

        maturity_score = update_data[
            "maturity"
        ]["score"]

        update_data["maturity"] = analyze_maturity(
            maturity_score
        )

    # Recalculate adoption
    if "adoption" in update_data:

        adoption_score = update_data[
            "adoption"
        ]["score"]

        update_data["adoption"] = analyze_adoption(
            adoption_score
        )

    update_data["updated_at"] = datetime.utcnow()

    result = technologies_collection.update_one(
        {"_id": object_id},
        {
            "$set": update_data
        }
    )

    if result.matched_count == 0:
        return None

    technology = technologies_collection.find_one(
        {"_id": object_id}
    )

    return serialize_technology(technology)


# =========================================================
# DELETE
# =========================================================

def delete_technology(
    technology_id: str
):

    try:
        object_id = ObjectId(technology_id)

    except InvalidId:
        return False

    result = technologies_collection.delete_one(
        {"_id": object_id}
    )

    return result.deleted_count > 0


# =========================================================
# MATURITY
# =========================================================

def get_maturity(
    technology_id: str
):

    technology = get_technology(
        technology_id
    )

    if not technology:
        return None

    return {
        "technology_id": technology["id"],
        "technology_name": technology["name"],
        "maturity": technology["maturity"]
    }


# =========================================================
# ADOPTION
# =========================================================

def get_adoption(
    technology_id: str
):

    technology = get_technology(
        technology_id
    )

    if not technology:
        return None

    return {
        "technology_id": technology["id"],
        "technology_name": technology["name"],
        "adoption": technology["adoption"]
    }


# =========================================================
# OPPORTUNITIES
# =========================================================

def get_opportunities():

    technologies = technologies_collection.find()

    opportunities = []

    for technology in technologies:

        maturity_score = technology[
            "maturity"
        ]["score"]

        adoption_score = technology[
            "adoption"
        ]["score"]

        opportunity = analyze_opportunity(
            maturity_score,
            adoption_score
        )

        opportunities.append({

            "id": str(
                technology["_id"]
            ),

            "name": technology["name"],

            "domain": technology["domain"],

            "description": technology[
                "description"
            ],

            "maturity": technology[
                "maturity"
            ],

            "adoption": technology[
                "adoption"
            ],

            "opportunity_score":
                opportunity[
                    "opportunity_score"
                ],

            "opportunity_level":
                opportunity[
                    "opportunity_level"
                ]
        })

    # Highest opportunity first
    opportunities.sort(
        key=lambda x: x["opportunity_score"],
        reverse=True
    )

    return opportunities