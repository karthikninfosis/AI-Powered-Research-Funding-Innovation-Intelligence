from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# Base Schema
class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    role_id: str
    is_active: bool = True


# Create User Schema
class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


# Update User Schema
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role_id: Optional[str] = None
    is_active: Optional[bool] = None
    last_active: Optional[datetime] = None


# Response Schema
class UserResponse(BaseModel):
    id: str
    user_id: str          # <-- New field
    name: str
    email: EmailStr
    password: str  
    role_id: str
    is_active: bool
    last_active: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True