from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ResearchDomainBase(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    code: str = Field(min_length=2, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)

    @field_validator("name", "code", mode="before")
    @classmethod
    def strip_required_fields(cls, value: str) -> str:
        if not isinstance(value, str):
            return value

        value = value.strip()
        if not value:
            raise ValueError("Field cannot be empty")
        return value

    @field_validator("description", mode="before")
    @classmethod
    def strip_description(cls, value: Optional[str]) -> Optional[str]:
        return value.strip() if isinstance(value, str) else value


class ResearchDomainCreate(ResearchDomainBase):
    pass


class ResearchDomainUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    code: Optional[str] = Field(default=None, min_length=2, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)

    @field_validator("name", "code", mode="before")
    @classmethod
    def strip_optional_fields(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None

        if not isinstance(value, str):
            return value

        value = value.strip()
        if not value:
            raise ValueError("Field cannot be empty")
        return value

    @field_validator("description", mode="before")
    @classmethod
    def strip_description(cls, value: Optional[str]) -> Optional[str]:
        return value.strip() if isinstance(value, str) else value


class ResearchDomainResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    name: str
    code: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
