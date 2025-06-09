"""Repository for user database operations."""

from sqlalchemy.orm import Session
from sqlalchemy import select
from app.schemas import CreateStudent, StudentLogin
from app.models import Students, Professors
from typing import Optional
from uuid import UUID
from app.utils import verify_password, hash_password

class StudentRepository:
  
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
    return self.db.execute(query).scalar_one_or_none
  
  def student_exists_by_email(self, email: str) -> bool:
    """Check if user exists by email"""
    return self.get_student_by_email(email) is not None
  
