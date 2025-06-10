"""Main FastApi application"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import user_auth

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

app.include_router(user_auth.router)

@app.get("/")
async def root():
  """root endpoint"""
  return {
    "message": "Welcome to Campus Connect Backend API"
  }