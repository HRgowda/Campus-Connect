from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import timedelta, datetime, UTC
from typing import Optional
import os

pwd_context = CryptContext(schemes=['bcrypt'], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "200"))

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