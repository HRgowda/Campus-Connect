from sqlalchemy.orm import Session
from app.repository import UserRepository
from app.schemas import CreateStudent, UserResponse
from fastapi import HTTPException, status

class AuthService:
  
  def __init__(self, db: Session):
    self.user_repo = UserRepository(db)
    
  def register_Student(self, data: CreateStudent) -> UserResponse:
     """Register a new student"""
     
     if self.user_repo.student_exists_by_email(data.email):
       raise HTTPException(
         status_code=status.HTTP_400_BAD_REQUEST,
         detail="Email already registered"
       )
       
     student = self.user_repo.createStudent(data)
     
     return student
    
    