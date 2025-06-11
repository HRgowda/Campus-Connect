from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import timedelta, datetime, UTC
from typing import Optional
import os
from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Students, Professors

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

def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
):
    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authenticated",
        )

    if token.startswith("Bearer "):
        token = token.split(" ")[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM)
        email_or_usn = payload.get("sub")
        role = payload.get("role")

        if email_or_usn is None or role is None:
            raise HTTPException(status_code=403, detail="Invalid credentials")

        if role == "student":
            user = db.query(Students).filter(Students.usn == email_or_usn).first()
        else:
            user = db.query(Professors).filter(Professors.email == email_or_usn).first()

        if user is None:
            raise HTTPException(status_code=403, detail="User not found")

        return {"user": user, "role": role}

    except JWTError:
        raise HTTPException(status_code=403, detail="Token is invalid or expired")