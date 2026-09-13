from datetime import date, datetime
from typing import Any, Optional

from bson import ObjectId
from bson.errors import InvalidId
from pymongo.errors import DuplicateKeyError

from app.config.database import db
from app.models.patent import PatentModel


patents_collection = db["patents"]
users_collection = db["users"]
roles_collection = db["roles"]


class PatentConflictError(Exception):
    pass


class PatentUserNotFoundError(Exception):
    pass


class PatentForbiddenError(Exception):
    pass


def is_valid_patent_id(patent_id: str) -> bool:
    return ObjectId.is_valid(patent_id)


def _object_id(value: str) -> Optional[ObjectId]:
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        return None


def _filing_date_value(value: Any) -> str:
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, date):
        return value.isoformat()
    return str(value)


def serialize_patent(patent: dict) -> dict:
    return {
        "id": str(patent["_id"]),
        "user_id": str(patent["user_id"]),
        "title": patent["title"],
        "patent_number": patent["patent_number"],
        "status": patent["status"],
        "filing_date": _filing_date_value(patent["filing_date"]),
        "assignee": patent["assignee"],
        "technology_domain": patent["technology_domain"],
        "classification": patent["classification"],
        "citation_count": patent.get("citation_count", 0),
        "abstract": patent["abstract"],
        "created_at": patent["created_at"],
        "updated_at": patent["updated_at"],
    }


def ensure_patent_indexes() -> None:
    """Create non-unique query indexes without changing legacy data semantics."""
    patents_collection.create_index("user_id")
    patents_collection.create_index("patent_number")
    patents_collection.create_index("technology_domain")
    patents_collection.create_index("assignee")
    patents_collection.create_index("filing_date")


def create_patent(patent_data: dict) -> dict:
    user_id = _object_id(patent_data["user_id"])
    if user_id is None or not users_collection.find_one({"_id": user_id}):
        raise PatentUserNotFoundError("User not found")

    patent_number = patent_data["patent_number"]
    if patents_collection.find_one({"patent_number": patent_number}):
        raise PatentConflictError("Patent number already exists")

    document_data = dict(patent_data)
    document_data["user_id"] = user_id
    filing_date = document_data["filing_date"]
    document_data["filing_date"] = _filing_date_value(filing_date)
    try:
        result = patents_collection.insert_one(PatentModel.create_document(document_data))
    except DuplicateKeyError as exc:
        raise PatentConflictError("Patent number already exists") from exc
    return get_patent(str(result.inserted_id))


def get_patents() -> list[dict]:
    return [serialize_patent(patent) for patent in patents_collection.find()]


def get_patent(patent_id: str) -> Optional[dict]:
    object_id = _object_id(patent_id)
    if object_id is None:
        return None
    patent = patents_collection.find_one({"_id": object_id})
    return serialize_patent(patent) if patent else None


def _is_admin(current_user: dict) -> bool:
    role = current_user.get("role")
    if isinstance(role, str) and role.lower() == "admin":
        return True
    role_id = _object_id(str(role)) if role else None
    if role_id is None:
        return False
    role_document = roles_collection.find_one({"_id": role_id})
    if not role_document:
        return False
    return str(role_document.get("code", "")).lower() == "admin" or str(
        role_document.get("name", "")
    ).lower() == "admin"


def assert_patent_owner(patent_id: str, current_user: dict) -> None:
    """Allow the owning user or an existing admin role to mutate a patent."""
    patent = get_patent(patent_id)
    if patent is None:
        return
    if _is_admin(current_user):
        return
    if patent["user_id"] != str(current_user.get("sub", "")):
        raise PatentForbiddenError("You do not have permission to modify this patent")


def assert_can_create_for_user(user_id: str, current_user: dict) -> None:
    if _is_admin(current_user):
        return
    if user_id != str(current_user.get("sub", "")):
        raise PatentForbiddenError("You can only create patents for your own user")


def update_patent(patent_id: str, patent_data: dict) -> Optional[dict]:
    object_id = _object_id(patent_id)
    if object_id is None:
        return None
    update_data = {key: value for key, value in patent_data.items() if value is not None}
    if not update_data:
        return get_patent(patent_id)
    if "filing_date" in update_data:
        update_data["filing_date"] = _filing_date_value(update_data["filing_date"])
    if "patent_number" in update_data:
        duplicate = patents_collection.find_one(
            {"patent_number": update_data["patent_number"], "_id": {"$ne": object_id}}
        )
        if duplicate:
            raise PatentConflictError("Patent number already exists")
    update_data["updated_at"] = datetime.utcnow()
    try:
        result = patents_collection.update_one({"_id": object_id}, {"$set": update_data})
    except DuplicateKeyError as exc:
        raise PatentConflictError("Patent number already exists") from exc
    return get_patent(patent_id) if result.matched_count else None


def delete_patent(patent_id: str) -> bool:
    object_id = _object_id(patent_id)
    if object_id is None:
        return False
    return patents_collection.delete_one({"_id": object_id}).deleted_count > 0
