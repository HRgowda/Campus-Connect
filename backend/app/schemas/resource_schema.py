"""Academic related pydantic schemas"""

from pydantic import BaseModel
from uuid import UUID

class AddSubject(BaseModel):
  """Schema for subject registration"""
  
  subjectName: str
  subjectCode: str
  semester: str
  
class UploadResource(BaseModel):
  
    resourceName: str
    resourceType: str
    resourceUrl: str
    subjectId: UUID