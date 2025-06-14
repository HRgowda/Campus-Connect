"""Main FastApi application"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import student, professor, auth

Base.metadata.create_all(bind = engine)

app = FastAPI(
  title="Campus Connect Backend",
  description="Backend API for campus connect application",
  version="1.0.0"
)

app.add_middleware(
  CORSMiddleware,
  allow_origins = "http://localhost:3000",
  allow_credentials = True,
  allow_methods = ["*"],
  allow_headers = ["*"],
  expose_headers = ["*"]
)

# Professor management routes
app.include_router(professor.router)

# Student management routes
app.include_router(student.router)

# Global auth routes
app.include_router(auth.router)

@app.get("/")
async def root():
  """root endpoint"""
  return {
    "message": "Welcome to Campus Connect Backend API"
  }