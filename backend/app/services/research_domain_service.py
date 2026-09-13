import re
from datetime import datetime
from typing import Any, Optional

from bson import ObjectId
from bson.errors import InvalidId

from app.config.database import db
from app.models.research_domain import ResearchDomainModel
from app.schemas.research_domain import ResearchDomainCreate, ResearchDomainUpdate


research_domains_collection = db.research_domains


class InvalidResearchDomainIdError(Exception):
    pass


class ResearchDomainCodeExistsError(Exception):
    pass


def _research_domain_object_id(research_domain_id: str) -> ObjectId:
    try:
        return ObjectId(research_domain_id)
    except InvalidId as exc:
        raise InvalidResearchDomainIdError("Invalid research domain ID") from exc


def _serialize(research_domain: dict[str, Any]) -> dict[str, Any]:
    return {
        **research_domain,
        "_id": str(research_domain["_id"]),
    }


class ResearchDomainService:
    @staticmethod
    async def create_research_domain(
        data: ResearchDomainCreate,
    ) -> dict[str, Any]:
        code = data.code.upper()

        existing_research_domain = research_domains_collection.find_one(
            {"code": {"$regex": f"^{re.escape(code)}$", "$options": "i"}}
        )
        if existing_research_domain:
            raise ResearchDomainCodeExistsError(
                "Research domain code already exists"
            )

        research_domain = ResearchDomainModel.create_document(
            {
                **data.model_dump(),
                "code": code,
            }
        )

        research_domains_collection.insert_one(research_domain)
        return _serialize(research_domain)

    @staticmethod
    async def get_research_domains() -> list[dict[str, Any]]:
        return [
            _serialize(research_domain)
            for research_domain in research_domains_collection.find()
        ]

    @staticmethod
    async def get_research_domain_by_id(
        research_domain_id: str,
    ) -> Optional[dict[str, Any]]:
        research_domain = research_domains_collection.find_one(
            {"_id": _research_domain_object_id(research_domain_id)}
        )
        return _serialize(research_domain) if research_domain else None

    @staticmethod
    async def update_research_domain(
        research_domain_id: str,
        data: ResearchDomainUpdate,
    ) -> Optional[dict[str, Any]]:
        research_domain_object_id = _research_domain_object_id(
            research_domain_id
        )

        if not research_domains_collection.find_one(
            {"_id": research_domain_object_id}
        ):
            return None

        update_data = data.model_dump(exclude_unset=True)

        if "code" in update_data:
            update_data["code"] = update_data["code"].upper()

            existing_research_domain = research_domains_collection.find_one(
                {
                    "code": {
                        "$regex": (
                            f"^{re.escape(update_data['code'])}$"
                        ),
                        "$options": "i",
                    },
                    "_id": {"$ne": research_domain_object_id},
                }
            )
            if existing_research_domain:
                raise ResearchDomainCodeExistsError(
                    "Research domain code already exists"
                )

        update_data["updated_at"] = datetime.utcnow()

        research_domains_collection.update_one(
            {"_id": research_domain_object_id},
            {"$set": update_data},
        )

        research_domain = research_domains_collection.find_one(
            {"_id": research_domain_object_id}
        )
        return _serialize(research_domain)

    @staticmethod
    async def delete_research_domain(research_domain_id: str) -> bool:
        research_domain_object_id = _research_domain_object_id(
            research_domain_id
        )

        result = research_domains_collection.delete_one(
            {"_id": research_domain_object_id}
        )
        return result.deleted_count > 0
