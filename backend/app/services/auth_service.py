from sqlalchemy.orm import Session
from app.repository import StudentRepository
from app.schemas import CreateStudent, UserResponse, StudentLogin, Token
from fastapi import HTTPException, status
from app.utils import verify_password, create_token

class StudentAuthService:
  
  def __init__(self, db: Session):
    self.user_repo = StudentRepository(db)
    
  def register_Student(self, data: CreateStudent) -> UserResponse:
     """Register a new student"""
     
     if self.user_repo.student_exists_by_email(data.email):
       raise HTTPException(
         status_code=status.HTTP_400_BAD_REQUEST,
         detail="Email already registered"
       )
       
     student = self.user_repo.createStudent(data)
     
     return student
   
  def student_login(self, data: StudentLogin) -> Token:
    """Authenticate Student and return JWT token."""
    
    student = self.user_repo.get_student_by_usn(data.usn)
    
    if not student and verify_password(data.password, student.password):
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid Usn or password."
      )
    
    access_token = create_token(data={
      "sub": data.usn
    })
    
    return Token(access_token=access_token)
    
    
    