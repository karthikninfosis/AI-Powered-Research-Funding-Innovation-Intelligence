"""Protected user-management routes."""

from datetime import datetime
from typing import Annotated, Any

import bcrypt
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, status

from app.config.database import db
from app.routes.auth import get_current_user, require_admin, response, serialize_user
from app.schemas.user import UserCreate, UserUpdate

router = APIRouter(prefix="/api/users", tags=["Users"])


def _object_id(value: str, label: str = "user ID") -> ObjectId:
    try:
        return ObjectId(value)
    except InvalidId:
        raise HTTPException(status_code=422, detail=f"Invalid {label}") from None


@router.get("/")
async def get_users(_: Annotated[dict[str, Any], Depends(require_admin)]) -> dict[str, Any]:
    """Return all users (admin only)."""
    return response("Users retrieved", [serialize_user(user) for user in db.users.find()])


@router.get("/me")
async def get_my_profile(current_user: Annotated[dict[str, Any], Depends(get_current_user)]) -> dict[str, Any]:
    """Return the active authenticated user's profile."""
    return response("Profile retrieved", serialize_user(current_user))


@router.get("/{id}")
async def get_user(id: str, _: Annotated[dict[str, Any], Depends(require_admin)]) -> dict[str, Any]:
    """Return one user by Mongo ID (admin only)."""
    user = db.users.find_one({"_id": _object_id(id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return response("User retrieved", serialize_user(user))


@router.put("/{id}")
async def update_user(id: str, body: UserUpdate, _: Annotated[dict[str, Any], Depends(require_admin)]) -> dict[str, Any]:
    """Update a user, validating unique email and an existing role."""
    user_id = _object_id(id)
    if not db.users.find_one({"_id": user_id}):
        raise HTTPException(status_code=404, detail="User not found")
    changes = body.model_dump(exclude_unset=True)
    if "email" in changes:
        changes["email"] = str(changes["email"]).lower()
        duplicate = db.users.find_one({"email": changes["email"], "_id": {"$ne": user_id}})
        if duplicate:
            raise HTTPException(status_code=422, detail="Email already exists")
    if "role_id" in changes:
        role_id = _object_id(changes["role_id"], "role_id")
        if not db.roles.find_one({"_id": role_id}):
            raise HTTPException(status_code=404, detail="Role not found")
        changes["role_id"] = role_id
    if "password" in changes:
        changes["password"] = bcrypt.hashpw(changes["password"].encode(), bcrypt.gensalt()).decode()
    changes["updated_at"] = datetime.utcnow()
    db.users.update_one({"_id": user_id}, {"$set": changes})
    return response("User updated successfully", serialize_user(db.users.find_one({"_id": user_id})))


@router.delete("/{id}", status_code=status.HTTP_200_OK)
async def delete_user(id: str, current_user: Annotated[dict[str, Any], Depends(require_admin)]) -> dict[str, Any]:
    """Delete a user (admin only), while preventing self-deletion."""
    user_id = _object_id(id)
    if user_id == current_user["_id"]:
        raise HTTPException(status_code=422, detail="Administrators cannot delete their own account")
    if db.users.delete_one({"_id": user_id}).deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return response("User deleted successfully")


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_user(body: UserCreate, _: Annotated[dict[str, Any], Depends(require_admin)]) -> dict[str, Any]:
    """Create a user through the administrative API."""
    # Registration owns creation semantics; keeping this endpoint makes the original API available.
    from app.routes.auth import register
    return await register(body)
