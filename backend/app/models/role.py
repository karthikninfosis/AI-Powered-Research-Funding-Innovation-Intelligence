from datetime import datetime
from bson import ObjectId


class RoleModel:
    @staticmethod
    def create_document(data: dict):
        return {
            "roleId": data["roleId"],
            "name": data["name"],
            "code": data["code"],
            "permissions": data.get("permissions", []),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        }

        