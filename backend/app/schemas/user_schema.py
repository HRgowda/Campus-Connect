"""User related Pydantic schemas"""

from pydantic import BaseModel, EmailStr
from uuid import UUID

class CreateStudent(BaseModel):
  """Schema for student registration."""
  
  usn: str
  email: EmailStr
  name: str
  password: str
  
class CreateProfessor(BaseModel):
  """Schema for Professor registration."""
  
  name: str
  email: EmailStr
  password: str
  
class StudentLogin(BaseModel):
  """Schema for student login."""
  
  usn: str
  password: str
  
class ProfessorLogin(BaseModel):
  """Schema for Porfessor login"""
  
  email: EmailStr
  password: str
  
class UserResponse(BaseModel):
  """Schema for user response."""
  
  id: UUID
  email: str | None = None
  usn: str | None = None
  role: str
  name: str
  
class Token(BaseModel):
  """Schema for JWT response."""
  
  access_token: str
  token_type: str = "bearer"
  
class FetchProfessor(BaseModel):
  """Schema to fecth all professors"""
  
  name: str
  email: str
  id: UUID