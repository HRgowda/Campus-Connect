"""Main FastApi application"""

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import student, professor, auth, channel, common
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

# Common routes for both professor and students
app.include_router(common.router)

# Global auth routes
app.include_router(auth.router)

# Mount the directory to serve files

# FastAPI by default does not serve static files like PDFs, images, or CSS/JS files. It only serves API endpoints that you explicitly define (like /api/users, /auth/login, etc.)

# Imagine you placed a file inside a drawer (uploads/resources/myfile.pdf) but never told anyone which drawer to open.
# FastAPI needs a "map" or "route" to say
app.mount("/resources", StaticFiles(directory="uploads/resources"), name="resources")

@app.get("/")
async def root():
  """root endpoint"""
  return {
    "message": "Welcome to Campus Connect Backend API"
  }