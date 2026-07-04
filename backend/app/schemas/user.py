from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import RoleEnum

class UserBase(BaseModel):
    full_name: str
    email: Optional[EmailStr] = None
    phone_number: str
    role: RoleEnum = RoleEnum.CITIZEN
    department: Optional[str] = None
    district_code: Optional[str] = "BBSR"
    ward_number: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    hierarchy_level: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
