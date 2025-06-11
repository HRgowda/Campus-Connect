from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import timedelta, datetime, UTC
from typing import Optional
import os
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Students, Professors

pwd_context = CryptContext(schemes=['bcrypt'], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "200"))

security = HTTPBearer()

def hash_password(password: str):
  return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
  return pwd_context.verify(plain_password, hashed_password)

def create_token(data: dict, expires_delta: Optional[timedelta] = None) -> str :
  """Create a jwt token"""
  
  to_encode = data.copy()
  
  if expires_delta:
    expire = datetime.now(UTC) + expires_delta
  else:
    expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
  to_encode.update({"exp" : expire})
  
  encoded_jwt  = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
  
  return encoded_jwt

def get_current_user( credentials: HTTPAuthorizationCredentials = Depends(security), 
  db: Session = Depends(get_db)):
  
  """Get current authenticated user."""
  
  credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate" : "Bearer"}
  )
  
  try:
    payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=ALGORITHM)
    email_or_usn = payload.get("sub")
    role = payload.get("role")
    
    if email_or_usn is None or role is None:
      raise credentials_exception
    
    if (role == "student"):
      user = db.query(Students).filter(Students.usn == email_or_usn).first()
    else:
      user = db.query(Professors).filter(Professors.email == email_or_usn).first() 
          
  except JWTError:
    raise credentials_exception
  
  if user is None:
    raise credentials_exception
  
  return {
    "user": user,
    "role": role
  }
    
    