from pydantic import BaseModel
from typing import Optional


class Publication(BaseModel):
    id: Optional[str] = None
    user_id: str
    title: str
    journal: str
    year: int
    doi: str