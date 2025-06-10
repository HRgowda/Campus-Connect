from sqlalchemy.orm import Session
from app.repository import StudentRepository, ProfessorRepository
from app.schemas import CreateStudent, UserResponse, StudentLogin, Token, ProfessorLogin, CreateProfessor
from fastapi import HTTPException, status
from app.utils import verify_password, create_token

class StudentAuthService:
  
  def __init__(self, db: Session):
    self.student_repo = StudentRepository(db)
    
  def register_Student(self, data: CreateStudent) -> UserResponse:
     """Register a new student"""
     
     if self.student_repo.student_exists_by_email(data.email):
       raise HTTPException(
         status_code=status.HTTP_400_BAD_REQUEST,
         detail="Email already registered"
       )
       
     student = self.student_repo.createStudent(data)
     
     return student
   
  def student_login(self, data: StudentLogin) -> Token:
    """Authenticate Student and return JWT token."""
    
    student = self.student_repo.get_student_by_usn(data.usn)
    
    if not student or not verify_password(data.password, student.password):
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid Usn or password."
      )
    
    access_token = create_token(data={
      "sub": data.usn
    })
    
    return Token(access_token=access_token)
    
class ProfessorAuthService:
  
  def __init__(self, db: Session):
    self.professor_repo = ProfessorRepository(db)
    
  def register_Professor(self, data: CreateProfessor) -> UserResponse:
    """Register a new Professor"""
    
    if self.professor_repo.exists_by_email(data.email):
      raise HTTPException (
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Email already registered."
      )
      
    professor = self.professor_repo.createProfessor(data=data)
    
    return professor
  
  def login_Professor(self, data: ProfessorLogin) -> Token:
    """Authentication Professor and return JWT token."""
    
    professor = self.professor_repo.get_by_email(data.email)
    
    if not professor and verify_password(data.password, professor.password):
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid Email or password."
      )
    
    access_token = create_token(data={
      "sub": data.email
    })
    
    return Token(access_token = access_token)