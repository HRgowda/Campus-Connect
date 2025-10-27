from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from uuid import UUID

# Website schema
class WebsiteBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    url: str = Field(..., min_length=1, max_length=500)

class WebsiteCreate(WebsiteBase):
    pass

class WebsiteResponse(WebsiteBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Student Profile schemas
class StudentProfileBase(BaseModel):
    bio: Optional[str] = Field(None, max_length=1000)
    location: Optional[str] = Field(None, max_length=200)
    skills: List[str] = Field(default_factory=list)
    linkedin: Optional[str] = Field(None, max_length=500)
    github: Optional[str] = Field(None, max_length=500)
    avatar: Optional[str] = Field(None, max_length=500)

class StudentProfileCreate(StudentProfileBase):
    student_id: UUID

class StudentProfileUpdate(BaseModel):
    bio: Optional[str] = Field(None, max_length=1000)
    location: Optional[str] = Field(None, max_length=200)
    skills: Optional[List[str]] = None
    linkedin: Optional[str] = Field(None, max_length=500)
    github: Optional[str] = Field(None, max_length=500)
    avatar: Optional[str] = Field(None, max_length=500)

class StudentProfileResponse(StudentProfileBase):
    id: UUID
    student_id: UUID
    created_at: datetime
    updated_at: datetime
    websites: List[WebsiteResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True

# Student schemas
class StudentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    usn: str = Field(..., min_length=1, max_length=20)

class StudentCreate(StudentBase):
    password: str = Field(..., min_length=6, max_length=100)

class StudentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6, max_length=100)

class StudentResponse(StudentBase):
    id: UUID
    created_at: datetime
    profile: Optional[StudentProfileResponse] = None

    class Config:
        from_attributes = True

# Professor schemas
class ProfessorBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr

class ProfessorCreate(ProfessorBase):
    password: str = Field(..., min_length=6, max_length=100)

class ProfessorUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6, max_length=100)

class ProfessorResponse(ProfessorBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Profile completion status
class ProfileCompletionStatus(BaseModel):
    is_complete: bool
    completion_percentage: int
    missing_fields: List[str]
    total_fields: int = 6  # bio, location, skills, linkedin, github, avatar

# Website management
class WebsiteUpdate(WebsiteBase):
    pass

# Profile statistics
class ProfileStats(BaseModel):
    total_students: int
    total_professors: int
    profiles_completed: int
    completion_rate: float
