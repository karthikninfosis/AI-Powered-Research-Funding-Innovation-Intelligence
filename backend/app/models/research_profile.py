from typing import List, Optional
from pydantic import BaseModel


class ResearchProfile(BaseModel):
    user_id: str
    organization: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    country: Optional[str] = None

    research_domains: List[str] = []
    keywords: List[str] = []
    technology_areas: List[str] = []