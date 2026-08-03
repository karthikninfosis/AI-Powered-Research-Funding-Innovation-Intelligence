"""Admin-only role management routes."""

from datetime import datetime
from typing import Annotated, Any

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.config.database import db
from app.routes.auth import require_admin, response
from app.schemas.role import RoleCreate, RoleUpdate

router = APIRouter(prefix="/api/roles", tags=["Roles"])


class RoleAssignment(BaseModel):
    """Role target for a user assignment operation."""
    user_id: str = Field(min_length=1)


def _oid(value: str, label: str) -> ObjectId:
    try:
        return ObjectId(value)
    except InvalidId:
        raise HTTPException(status_code=422, detail=f"Invalid {label}") from None


def _serialize(role: dict[str, Any]) -> dict[str, Any]:
    return {**role, "_id": str(role["_id"])}


async def _next_role_id() -> str:
    last = db.roles.find_one({}, sort=[("roleId", -1)])
    number = int(last["roleId"].replace("Role", "")) + 1 if last and last.get("roleId") else 1
    return f"Role{number:03d}"


@router.get("")
async def get_roles(_: Annotated[dict[str, Any], Depends(require_admin)]) -> dict[str, Any]:
    """List all roles."""
    return response("Roles retrieved", [_serialize(role) for role in db.roles.find()])


@router.get("/{role_id}")
async def get_role(role_id: str, _: Annotated[dict[str, Any], Depends(require_admin)]) -> dict[str, Any]:
    """Get a role by ID."""
    role = db.roles.find_one({"_id": _oid(role_id, "role ID")})
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return response("Role retrieved", _serialize(role))


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_role(role: RoleCreate, _: Annotated[dict[str, Any], Depends(require_admin)]) -> dict[str, Any]:
    """Create a role with a unique, case-insensitive code."""
    code = role.code.strip().upper()
    if db.roles.find_one({"code": {"$regex": f"^{code}$", "$options": "i"}}):
        raise HTTPException(status_code=422, detail="Role code already exists")
    now = datetime.utcnow()
    document = {"roleId": await _next_role_id(), "name": role.name, "code": code, "permissions": role.permissions, "createdAt": now, "updatedAt": now}
    document["_id"] = db.roles.insert_one(document).inserted_id
    return response("Role created successfully", _serialize(document))


@router.put("/{role_id}")
async def update_role(role_id: str, role: RoleUpdate, _: Annotated[dict[str, Any], Depends(require_admin)]) -> dict[str, Any]:
    """Update role fields while preserving code uniqueness."""
    oid = _oid(role_id, "role ID")
    if not db.roles.find_one({"_id": oid}):
        raise HTTPException(status_code=404, detail="Role not found")
    changes = role.model_dump(exclude_unset=True)
    if "code" in changes:
        changes["code"] = changes["code"].strip().upper()
        if db.roles.find_one({"code": {"$regex": f"^{changes['code']}$", "$options": "i"}, "_id": {"$ne": oid}}):
            raise HTTPException(status_code=422, detail="Role code already exists")
    changes["updatedAt"] = datetime.utcnow()
    db.roles.update_one({"_id": oid}, {"$set": changes})
    return response("Role updated successfully", _serialize(db.roles.find_one({"_id": oid})))


@router.delete("/{role_id}")
async def delete_role(role_id: str, _: Annotated[dict[str, Any], Depends(require_admin)]) -> dict[str, Any]:
    """Delete an unassigned role."""
    oid = _oid(role_id, "role ID")
    if db.users.find_one({"role_id": oid}):
        raise HTTPException(status_code=422, detail="Role is assigned to one or more users")
    if db.roles.delete_one({"_id": oid}).deleted_count == 0:
        raise HTTPException(status_code=404, detail="Role not found")
    return response("Role deleted successfully")


@router.post("/{role_id}/users")
async def assign_role(role_id: str, body: RoleAssignment, _: Annotated[dict[str, Any], Depends(require_admin)]) -> dict[str, Any]:
    """Assign a role to a user."""
    role_oid, user_oid = _oid(role_id, "role ID"), _oid(body.user_id, "user ID")
    if not db.roles.find_one({"_id": role_oid}):
        raise HTTPException(status_code=404, detail="Role not found")
    if db.users.update_one({"_id": user_oid}, {"$set": {"role_id": role_oid, "updated_at": datetime.utcnow()}}).matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return response("Role assigned successfully")


@router.delete("/{role_id}/users/{user_id}")
async def remove_role(role_id: str, user_id: str, _: Annotated[dict[str, Any], Depends(require_admin)]) -> dict[str, Any]:
    """Remove this role from a user only when it is currently assigned."""
    role_oid, user_oid = _oid(role_id, "role ID"), _oid(user_id, "user ID")
    if not db.roles.find_one({"_id": role_oid}):
        raise HTTPException(status_code=404, detail="Role not found")
    if db.users.update_one({"_id": user_oid, "role_id": role_oid}, {"$set": {"role_id": None, "updated_at": datetime.utcnow()}}).matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found or role is not assigned")
    return response("Role removed successfully")
