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

        update_data = {
            k: v
            for k, v in data.dict(exclude_unset=True).items()
        }

        update_data["updatedAt"] = datetime.utcnow()

        roles_collection.update_one(
            {"_id": ObjectId(role_id)},
            {"$set": update_data}
        )

        role = roles_collection.find_one({"_id": ObjectId(role_id)})

        role["_id"] = str(role["_id"])

        return role


    @staticmethod
    async def delete_role(role_id):

        result = roles_collection.delete_one(
            {"_id": ObjectId(role_id)}
        )

        return result.deleted_count > 0