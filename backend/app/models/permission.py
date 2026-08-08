from datetime import datetime

from bson import ObjectId


class PermissionModel:
    @staticmethod
    def create_document(data: dict) -> dict:
        now = datetime.utcnow()

        return {
            "_id": data.get("_id", ObjectId()),
            "name": data["name"],
            "code": data["code"],
            "description": data.get("description"),
            "module": data["module"],
            "created_at": data.get("created_at", now),
            "updated_at": data.get("updated_at", now),
        }
