"""Channel related Pydantic schemas"""

from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional

class CreateChannel(BaseModel):
  """Schema to create a channel"""
  
  name: str
  description: Optional[str] = None
  is_Private: bool = Field(..., alias="isPrivate")
  created_by_id: UUID
  created_by_role: str
  
  class Config: # Allows model initialization using either field names (e.g., is_private) or their aliases (e.g., isPrivate)
    allow_population_by_field_name = True
  