import re
from datetime import datetime
from typing import Any, Optional

from bson import ObjectId
from bson.errors import InvalidId

from app.config.database import db
from app.models.permission import PermissionModel
from app.schemas.permission import PermissionCreate, PermissionUpdate


permissions_collection = db.permissions


class InvalidPermissionIdError(Exception):
    pass


class InvalidRoleIdError(Exception):
    pass


class PermissionCodeExistsError(Exception):
    pass


class RoleNotFoundError(Exception):
    pass


def _to_object_id(value: str, error_type: type[Exception]) -> ObjectId:
    try:
        return ObjectId(value)
    except InvalidId as exc:
        raise error_type from exc


def _permission_object_id(permission_id: str) -> ObjectId:
    try:
        return _to_object_id(permission_id, InvalidPermissionIdError)
    except InvalidPermissionIdError as exc:
        raise InvalidPermissionIdError("Invalid permission ID") from exc


def _role_object_id(role_id: str) -> ObjectId:
    try:
        return _to_object_id(role_id, InvalidRoleIdError)
    except InvalidRoleIdError as exc:
        raise InvalidRoleIdError("Invalid role ID") from exc


def _serialize(permission: dict[str, Any]) -> dict[str, Any]:
    return {
        **permission,
        "_id": str(permission["_id"]),
        "module": permission.get("module", ""),
    }


class PermissionService:
    @staticmethod
    async def create_permission(data: PermissionCreate) -> dict[str, Any]:
        code = data.code.upper()

        existing_permission = permissions_collection.find_one(
            {"code": {"$regex": f"^{re.escape(code)}$", "$options": "i"}}
        )
        if existing_permission:
            raise PermissionCodeExistsError("Permission code already exists")

        permission = PermissionModel.create_document(
            {
                **data.model_dump(),
                "code": code,
            }
        )

        permissions_collection.insert_one(permission)
        return _serialize(permission)

    @staticmethod
    async def get_permissions() -> list[dict[str, Any]]:
        return [_serialize(permission) for permission in permissions_collection.find()]

    @staticmethod
    async def get_permission_by_id(
        permission_id: str,
    ) -> Optional[dict[str, Any]]:
        permission = permissions_collection.find_one(
            {"_id": _permission_object_id(permission_id)}
        )
        return _serialize(permission) if permission else None

    @staticmethod
    async def update_permission(
        permission_id: str,
        data: PermissionUpdate,
    ) -> Optional[dict[str, Any]]:
        permission_object_id = _permission_object_id(permission_id)

        if not permissions_collection.find_one({"_id": permission_object_id}):
            return None

        update_data = data.model_dump(exclude_unset=True)

        if "code" in update_data:
            update_data["code"] = update_data["code"].upper()

            existing_permission = permissions_collection.find_one(
                {
                    "code": {
                        "$regex": f"^{re.escape(update_data['code'])}$",
                        "$options": "i",
                    },
                    "_id": {"$ne": permission_object_id},
                }
            )
            if existing_permission:
                raise PermissionCodeExistsError("Permission code already exists")

        update_data["updated_at"] = datetime.utcnow()

        permissions_collection.update_one(
            {"_id": permission_object_id},
            {"$set": update_data},
        )

        permission = permissions_collection.find_one(
            {"_id": permission_object_id}
        )
        return _serialize(permission)

    @staticmethod
    async def delete_permission(permission_id: str) -> bool:
        permission_object_id = _permission_object_id(permission_id)

        permission = permissions_collection.find_one(
            {"_id": permission_object_id}
        )
        if not permission:
            return False

        db.roles.update_many(
            {},
            {"$pull": {"permissions": {"$in": [permission["code"], str(permission_object_id)]}}},
        )

        result = permissions_collection.delete_one(
            {"_id": permission_object_id}
        )

        return result.deleted_count > 0

    @staticmethod
    async def assign_permission_to_role(
        role_id: str,
        permission_id: str,
    ) -> bool:
        role_object_id = _role_object_id(role_id)
        permission_object_id = _permission_object_id(permission_id)

        if not db.roles.find_one({"_id": role_object_id}):
            raise RoleNotFoundError("Role not found")

        permission = permissions_collection.find_one(
            {"_id": permission_object_id}
        )
        if not permission:
            return False

        db.roles.update_one(
            {"_id": role_object_id},
            {
                "$addToSet": {"permissions": permission["code"]},
                "$set": {"updatedAt": datetime.utcnow()},
            },
        )
        return True

    @staticmethod
    async def remove_permission_from_role(
        role_id: str,
        permission_id: str,
    ) -> bool:
        role_object_id = _role_object_id(role_id)
        permission_object_id = _permission_object_id(permission_id)

        if not db.roles.find_one({"_id": role_object_id}):
            raise RoleNotFoundError("Role not found")

        permission = permissions_collection.find_one(
            {"_id": permission_object_id}
        )
        if not permission:
            return False

        db.roles.update_one(
            {"_id": role_object_id},
            {
                "$pull": {"permissions": {"$in": [permission["code"], str(permission_object_id)]}},
                "$set": {"updatedAt": datetime.utcnow()},
            },
        )
        return True
