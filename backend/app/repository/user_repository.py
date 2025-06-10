"""Repository for user database operations."""

from sqlalchemy.orm import Session
from sqlalchemy import select
from app.schemas import CreateStudent, CreateProfessor
from app.models import Students, Professors
from typing import Optional
from uuid import UUID
from app.utils import hash_password

class StudentRepository:
  """Handles student-related database operations."""
  
  def __init__(self, db: Session):
    self.db = db
    
  def createStudent(self, data: CreateStudent) -> Students:
    student = Students(
      usn = data.usn,
      name = data.name,
      email = data.email,
      password = hash_password(data.password)
    )
    self.db.add(student)
    self.db.commit()
    self.db.refresh(student)
    return student
      
  def get_student_by_email(self, email: str) -> Optional[Students]:
    query = select(Students).where(Students.email == email)
    return self.db.execute(query).scalar_one_or_none()
  
  def get_student_by_id(self, studentid: UUID) -> Optional[Students]:
    query = select(Students).where(Students.id == studentid)
    return self.db.execute(query).scalar_one_or_none()
  
  def get_student_by_usn(self, usn: str) -> Optional[Students]:
    query = select(Students).where(Students.usn == usn)
    return self.db.execute(query).scalar_one_or_none()
  
  def student_exists_by_email(self, email: str) -> bool:
    """Check if student exists by email"""
    return self.get_student_by_email(email) is not None
  
class ProfessorRepository:
  """Handles professor-related database operations."""
  
  def __init__(self, db: Session):
    self.db = db
    
  def createProfessor(self, data: CreateProfessor) -> Professors:
    professor = Professors(
      name = data.name,
      email = data.email,
      password = hash_password(data.password)
    )
    self.db.add(professor)
    self.db.commit()
    self.db.refresh(professor)
    return professor
  
  def get_by_email(self, email: str) -> Optional[Professors]:
    query = select(Professors).where(Professors.email == email)
    return self.db.execute(query).scalar_one_or_none()
  
  def get_by_id(self, professorId: UUID) -> Optional[Professors]:
    query = select(Professors).where(Professors.id == professorId)
    return self.db.execute(query).scalar_one_or_none()
  
  def exists_by_email(self, email: str) -> bool:
    return self.get_by_email(email) is not None