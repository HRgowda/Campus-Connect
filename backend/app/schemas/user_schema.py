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
  
class UserLogin(BaseModel):
  """Schema for both student and professor login."""
  
  email: EmailStr
  password: str
  
class UserResponse(BaseModel):
  """Schema for user response."""
  
  id: UUID
  email: str
  
class Token(BaseModel):
  """Schema for JWT response."""
  
  access_token: str
  token_type: str = "bearer"