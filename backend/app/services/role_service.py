from bson import ObjectId
from datetime import datetime

from app.config.database import db
from app.models.role import RoleModel


roles_collection = db.roles


class RoleService:

    @staticmethod
    async def generate_role_id():

        last_role = roles_collection.find_one(
            {},
            sort=[("roleId", -1)]
        )

        if not last_role:
            return "Role001"

        last_number = int(last_role["roleId"].replace("Role", ""))

        return f"Role{last_number+1:03d}"


    @staticmethod
    async def get_roles():

        roles = []

        cursor = roles_collection.find()

        for role in cursor:
            role["_id"] = str(role["_id"])
            roles.append(role)

        return roles


    @staticmethod
    async def create_role(data):

        exists = roles_collection.find_one({"code": data.code})

        if exists:
            raise Exception("Role code already exists")

        role = RoleModel.create_document({
            **data.dict(),
            "roleId": await RoleService.generate_role_id()
        })

        result = roles_collection.insert_one(role)

        role["_id"] = str(result.inserted_id)

        return role


    @staticmethod
    async def update_role(role_id, data):

        update_fields = data.dict(exclude_unset=True)

        # Pull permissions out so it doesn't go through $set
        # (which would overwrite the whole array instead of
        # appending to it)
        new_permissions = update_fields.pop("permissions", None)

        update_fields["updatedAt"] = datetime.utcnow()

        update_ops = {"$set": update_fields}

        if new_permissions:
            # $addToSet + $each adds every new permission that
            # isn't already present, without touching existing ones
            update_ops["$addToSet"] = {
                "permissions": {"$each": new_permissions}
            }

        roles_collection.update_one(
            {"_id": ObjectId(role_id)},
            update_ops
        )

        role = roles_collection.find_one({"_id": ObjectId(role_id)})

        if role:
            role["_id"] = str(role["_id"])

        return role


    @staticmethod
    async def remove_permission(role_id, permission):

        roles_collection.update_one(
            {"_id": ObjectId(role_id)},
            {
                "$pull": {"permissions": permission},
                "$set": {"updatedAt": datetime.utcnow()}
            }
        )

        role = roles_collection.find_one({"_id": ObjectId(role_id)})

        if role:
            role["_id"] = str(role["_id"])

        return role


    @staticmethod
    async def delete_role(role_id):

        result = roles_collection.delete_one(
            {"_id": ObjectId(role_id)}
        )

        return result.deleted_count > 0