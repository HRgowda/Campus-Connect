"""Main FastApi application"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import student, professor, auth, channel
from app.utils import limiter, rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

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

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# Professor management routes
app.include_router(professor.router)

# Student management routes
app.include_router(student.router)

# Channel management routes
app.include_router(channel.router)

# Global auth routes
app.include_router(auth.router)

@app.get("/")
async def root():
  """root endpoint"""
  return {
    "message": "Welcome to Campus Connect Backend API"
  }