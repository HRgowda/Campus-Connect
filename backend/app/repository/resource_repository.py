"""Repository for academic resource db operatons"""

from sqlalchemy.orm import Session
from app.models import Subjects, Resources
from app.schemas import AddSubject, UploadResource, getSubjectSchema, getResourceSchema
from typing import Optional
from sqlalchemy import select

class Subject:
  
  def __init__(self, db: Session):
    self.db = db
    
  def addSubject(self, data: AddSubject) -> Subjects:
    subject = Subjects(
      subjectName = data.subjectName,
      subjectCode = data.subjectCode,
      semester = data.semester
    )
    
    self.db.add(subject)
    self.db.commit()
    self.db.refresh(subject)
    return subject
  
  def get_Subject(self, semester: str) -> list[getSubjectSchema]:
    query = select(Subjects).where(Subjects.semester == semester)
    return self.db.execute(query).scalars().all()
  
  
  def subject_exists_by_name_or_code(self, name: str, code: str) -> Optional[Subjects]:
    query = select(Subjects).where(
      (Subjects.subjectCode == code) | (Subjects.subjectName == name)
    )
    return self.db.execute(query).scalar_one_or_none()
  
class Resource:
  
  def __init__(self, db: Session):
    self.db = db
    
  def create_resource(self, data: UploadResource) -> Resources:
    resource = Resources(**data)
    self.db.add(resource)
    self.db.commit()
    self.db.refresh(resource)
    return resource

  def getResource(self, subjectId: str) -> list[getResourceSchema]:
    query = select(Resources).where(Resources.subjectId == subjectId)
    return self.db.execute(query).scalars().all()