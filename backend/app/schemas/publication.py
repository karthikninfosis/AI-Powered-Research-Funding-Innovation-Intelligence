from pydantic import BaseModel
from typing import Optional


class PublicationCreate(BaseModel):
    user_id: str
    title: str
    journal: str
    year: int
    doi: str


class PublicationUpdate(BaseModel):
    title: Optional[str] = None
    journal: Optional[str] = None
    year: Optional[int] = None
    doi: Optional[str] = None


class PublicationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    journal: str
    year: int
    doi: str