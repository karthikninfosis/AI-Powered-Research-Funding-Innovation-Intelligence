"""Admin-only permission and role-permission management routes."""

from datetime import datetime
from typing import Annotated, Any

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.config.database import db
from app.routes.auth import require_admin, response

router = APIRouter(prefix="/api/permissions", tags=["Permissions"])


class PermissionCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    code: str = Field(min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=500)


class PermissionUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    code: str | None = Field(default=None, min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=500)


class PermissionAssignment(BaseModel):
    permission_id: str


def _oid(value: str, label: str) -> ObjectId:
    try:
        return ObjectId(value)
    except InvalidId:
        raise HTTPException(status_code=422, detail=f"Invalid {label}") from None


def _serialize(permission: dict[str, Any]) -> dict[str, Any]:
    return {**permission, "_id": str(permission["_id"])}


@router.get("")
async def get_permissions(_: Annotated[dict[str, Any], Depends(require_admin)]) -> dict[str, Any]:
    """List all permissions."""
    return response("Permissions retrieved", [_serialize(item) for item in db.permissions.find()])


@router.get("/{permission_id}")
async def get_permission(permission_id: str, _: Annotated[dict[str, Any], Depends(require_admin)]) -> dict[str, Any]:
    """Get a permission by ID."""
    item = db.permissions.find_one({"_id": _oid(permission_id, "permission ID")})
    if not item:
        raise HTTPException(status_code=404, detail="Permission not found")
    return response("Permission retrieved", _serialize(item))


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_permission(body: PermissionCreate, _: Annotated[dict[str, Any], Depends(require_admin)]) -> dict[str, Any]:
    """Create a permission with a unique case-insensitive code."""
    code = body.code.strip().upper()
    if db.permissions.find_one({"code": {"$regex": f"^{code}$", "$options": "i"}}):
        raise HTTPException(status_code=422, detail="Permission code already exists")
    document = {"name": body.name, "code": code, "description": body.description, "createdAt": datetime.utcnow(), "updatedAt": datetime.utcnow()}
    document["_id"] = db.permissions.insert_one(document).inserted_id
    return response("Permission created successfully", _serialize(document))


@router.put("/{permission_id}")
async def update_permission(permission_id: str, body: PermissionUpdate, _: Annotated[dict[str, Any], Depends(require_admin)]) -> dict[str, Any]:
    """Update a permission while preserving code uniqueness."""
    oid = _oid(permission_id, "permission ID")
    if not db.permissions.find_one({"_id": oid}):
        raise HTTPException(status_code=404, detail="Permission not found")
    changes = body.model_dump(exclude_unset=True)
    if "code" in changes:
        changes["code"] = changes["code"].strip().upper()
        if db.permissions.find_one({"code": {"$regex": f"^{changes['code']}$", "$options": "i"}, "_id": {"$ne": oid}}):
            raise HTTPException(status_code=422, detail="Permission code already exists")
    changes["updatedAt"] = datetime.utcnow()
    db.permissions.update_one({"_id": oid}, {"$set": changes})
    return response("Permission updated successfully", _serialize(db.permissions.find_one({"_id": oid})))


@router.delete("/{permission_id}")
async def delete_permission(permission_id: str, _: Annotated[dict[str, Any], Depends(require_admin)]) -> dict[str, Any]:
    """Delete a permission after removing it from all roles."""
    oid = _oid(permission_id, "permission ID")
    item = db.permissions.find_one({"_id": oid})
    if not item:
        raise HTTPException(status_code=404, detail="Permission not found")
    # Roles can contain permission codes (preferred) or legacy permission IDs.
    db.roles.update_many({}, {"$pull": {"permissions": {"$in": [item["code"], str(oid)]}}})
    db.permissions.delete_one({"_id": oid})
    return response("Permission deleted successfully")


@router.post("/roles/{role_id}")
async def assign_permission(role_id: str, body: PermissionAssignment, _: Annotated[dict[str, Any], Depends(require_admin)]) -> dict[str, Any]:
    """Assign a permission code to a role without duplicates."""
    role_oid, permission_oid = _oid(role_id, "role ID"), _oid(body.permission_id, "permission ID")
    if not db.roles.find_one({"_id": role_oid}):
        raise HTTPException(status_code=404, detail="Role not found")
    permission = db.permissions.find_one({"_id": permission_oid})
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    db.roles.update_one({"_id": role_oid}, {"$addToSet": {"permissions": permission["code"]}, "$set": {"updatedAt": datetime.utcnow()}})
    return response("Permission assigned successfully")


@router.delete("/roles/{role_id}/{permission_id}")
async def remove_permission(role_id: str, permission_id: str, _: Annotated[dict[str, Any], Depends(require_admin)]) -> dict[str, Any]:
    """Remove a permission from a role."""
    role_oid, permission_oid = _oid(role_id, "role ID"), _oid(permission_id, "permission ID")
    if not db.roles.find_one({"_id": role_oid}):
        raise HTTPException(status_code=404, detail="Role not found")
    permission = db.permissions.find_one({"_id": permission_oid})
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    db.roles.update_one({"_id": role_oid}, {"$pull": {"permissions": {"$in": [permission["code"], str(permission_oid)]}}, "$set": {"updatedAt": datetime.utcnow()}})
    return response("Permission removed successfully")
