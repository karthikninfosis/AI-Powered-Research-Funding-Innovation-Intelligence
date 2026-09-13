from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class _PatentFields(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    patent_number: str = Field(..., min_length=1, max_length=100)
    status: str = Field(..., min_length=1, max_length=100)
    filing_date: date
    assignee: str = Field(..., min_length=1, max_length=500)
    technology_domain: str = Field(..., min_length=1, max_length=250)
    classification: str = Field(..., min_length=1, max_length=100)
    citation_count: int = Field(..., ge=0)
    abstract: str = Field(..., min_length=1)

    @field_validator(
        "title",
        "patent_number",
        "status",
        "assignee",
        "technology_domain",
        "classification",
        "abstract",
        mode="before",
    )
    @classmethod
    def strip_required_strings(cls, value: str) -> str:
        if not isinstance(value, str):
            return value
        return value.strip()


class PatentCreate(_PatentFields):
    user_id: str = Field(..., min_length=1)

    @field_validator("user_id", mode="before")
    @classmethod
    def strip_user_id(cls, value: str) -> str:
        return value.strip() if isinstance(value, str) else value


class PatentUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=500)
    patent_number: Optional[str] = Field(default=None, min_length=1, max_length=100)
    status: Optional[str] = Field(default=None, min_length=1, max_length=100)
    filing_date: Optional[date] = None
    assignee: Optional[str] = Field(default=None, min_length=1, max_length=500)
    technology_domain: Optional[str] = Field(default=None, min_length=1, max_length=250)
    classification: Optional[str] = Field(default=None, min_length=1, max_length=100)
    citation_count: Optional[int] = Field(default=None, ge=0)
    abstract: Optional[str] = Field(default=None, min_length=1)

    @field_validator(
        "title",
        "patent_number",
        "status",
        "assignee",
        "technology_domain",
        "classification",
        "abstract",
        mode="before",
    )
    @classmethod
    def strip_optional_strings(cls, value: Optional[str]) -> Optional[str]:
        return value.strip() if isinstance(value, str) else value


class PatentResponse(BaseModel):
    id: str
    user_id: str
    title: str
    patent_number: str
    status: str
    filing_date: date
    assignee: str
    technology_domain: str
    classification: str
    citation_count: int
    abstract: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
