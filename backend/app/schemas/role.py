from typing import List, Optional
from pydantic import BaseModel, Field


class RoleCreate(BaseModel):
    name: str
    code: str
    permissions: List[str] = []


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    permissions: Optional[List[str]] = None


class RoleResponse(BaseModel):
    id: str = Field(alias="_id")
    roleId: str
    name: str
    code: str
    permissions: List[str]