from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# -----------------------------
# Maturity
# -----------------------------

class Maturity(BaseModel):
    level: str
    score: float = Field(ge=0, le=100)


# -----------------------------
# Adoption
# -----------------------------

class Adoption(BaseModel):
    level: str
    score: float = Field(ge=0, le=100)


# -----------------------------
# Create Technology
# -----------------------------

class TechnologyCreate(BaseModel):
    name: str
    domain: str
    description: str

    maturity: Optional[Maturity] = None
    adoption: Optional[Adoption] = None


# -----------------------------
# Update Technology
# -----------------------------

class TechnologyUpdate(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    description: Optional[str] = None

    maturity: Optional[Maturity] = None
    adoption: Optional[Adoption] = None


# -----------------------------
# Technology Response
# -----------------------------

class TechnologyResponse(BaseModel):
    id: str
    name: str
    domain: str
    description: str

    maturity: Maturity
    adoption: Adoption

    created_at: datetime
    updated_at: datetime


# -----------------------------
# Opportunity Response
# -----------------------------

class TechnologyOpportunityResponse(BaseModel):
    id: str
    name: str
    domain: str
    description: str

    maturity: Maturity
    adoption: Adoption

    opportunity_score: float
    opportunity_level: str