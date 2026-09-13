from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class PermissionBase(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    code: str = Field(min_length=2, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    module: str = Field(min_length=2, max_length=100)

    @field_validator("name", "code", "module", mode="before")
    @classmethod
    def strip_required_fields(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Field cannot be empty")
        return value

    @field_validator("description", mode="before")
    @classmethod
    def strip_description(cls, value: Optional[str]) -> Optional[str]:
        return value.strip() if value is not None else None


class PermissionCreate(PermissionBase):
    pass


class PermissionUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    code: Optional[str] = Field(default=None, min_length=2, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    module: Optional[str] = Field(default=None, min_length=2, max_length=100)

    @field_validator("name", "code", "module", mode="before")
    @classmethod
    def strip_optional_fields(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None

        value = value.strip()
        if not value:
            raise ValueError("Field cannot be empty")
        return value

    @field_validator("description", mode="before")
    @classmethod
    def strip_description(cls, value: Optional[str]) -> Optional[str]:
        return value.strip() if value is not None else None


class PermissionAssignment(BaseModel):
    permission_id: str = Field(min_length=1)


class PermissionResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    name: str
    code: str
    description: Optional[str] = None
    module: str
    created_at: datetime
    updated_at: datetime
