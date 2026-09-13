from typing import List, Optional
from pydantic import BaseModel, Field


class ResearchProfileCreate(BaseModel):
    user_id: str

    organization: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    country: Optional[str] = None

    research_domains: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    technology_areas: List[str] = Field(default_factory=list)
    
class ResearchProfileUpdate(BaseModel):
    organization: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    country: Optional[str] = None

    research_domains: Optional[List[str]] = None
    keywords: Optional[List[str]] = None
    technology_areas: Optional[List[str]] = None

class ResearchProfileResponse(BaseModel):
    id: str
    user_id: str

    organization: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    country: Optional[str] = None

    research_domains: List[str]
    keywords: List[str]
    technology_areas: List[str]

    created_at: str
    updated_at: str