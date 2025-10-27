"""Repository for user database operations."""

from sqlalchemy.orm import Session
from sqlalchemy import select
from app.schemas import CreateStudent, CreateProfessor, CreateStudentProfile
from app.models import Students, Professors, StudentProfile, Website
from typing import Optional, List
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
  
  def create_student_profile(self, data: CreateStudentProfile):
    
    new_profile = StudentProfile(
      bio = data.bio,
      location = data.location,
      skills = data.skills,
      student_id = data.student_id
    )
    
    self.db.add(new_profile)
    self.db.commit()
    self.db.refresh(new_profile)
    
    # Add websites only if provided
    if data.website:
      for website in data.website:
        new_website = Website(
          name = website.name,
          url = str(website.url),
          student_profile_id = new_profile.id
        )
        self.db.add(new_website)
      
      self.db.commit()
      
    return new_profile
  
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
  
  def fetchAllProfessor(self) -> List[Professors]:
    query = select(Professors)
    return self.db.execute(query).scalars().all()