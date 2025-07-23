from fastapi import APIRouter, Depends, status, Response, File, Form, UploadFile
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import CreateProfessor, UserResponse, ProfessorLogin, Token, AddSubject, UploadResource
from app.services.auth_service import ProfessorAuthService
from app.services.resource_service import ResourceService

router = APIRouter(
    prefix="/professor",
    tags=["Professor Management"],
)

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(professor_data: CreateProfessor, db: Session = Depends(get_db)):
    auth_service = ProfessorAuthService(db)
    return auth_service.register_Professor(professor_data)

@router.post("/signin", response_model=Token, status_code=status.HTTP_200_OK)
async def signin(response: Response, professor_data: ProfessorLogin, db: Session = Depends(get_db)):
    auth_service = ProfessorAuthService(db)
    token = auth_service.login_Professor(professor_data)

    response.set_cookie(
        key="access_token",
        value=f"Bearer {token.access_token}",
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=24 * 60 * 60
    )
    return token

@router.post("/add_subject", status_code=status.HTTP_201_CREATED)
def addSubject(subject_data: AddSubject, db: Session = Depends(get_db)):
    add_subject =  ResourceService(db)
    return add_subject.AddSubject(subject_data)

@router.post("/upload_resource", status_code=status.HTTP_201_CREATED)
# Handles resource upload using multipart/form-data.
# Note: When sending both files and fields from frontend (e.g., file + resourceName),
# we cannot use standard JSON (application/json); instead, we use multipart/form-data.
# So we extract values using Form(...) and File(...), then manually create a Pydantic model.

def uploadResource( file: UploadFile = File(...), resourceName: str = Form(...), subjectId: str = Form(...), db: Session = Depends(get_db)):
    
    resource_data = UploadResource(resourceName=resourceName, subjectId=subjectId)
    
    add_resource = ResourceService(db)
    
    return add_resource.upload_and_create_resource(file, resource_data)