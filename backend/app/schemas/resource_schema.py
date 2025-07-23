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
  subjectId: UUID
    
class getSubjectSchema(BaseModel):
  
  subjectName: str
  subjectCode: str
  semester: str
  
class getResourceSchema(BaseModel):
  
  resourceName: str
  resourceType: str
  resourceUrl: str