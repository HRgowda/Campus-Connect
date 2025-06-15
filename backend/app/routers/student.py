from fastapi import APIRouter, Depends, status, Response, UploadFile, File, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import CreateStudent, UserResponse, StudentLogin, Token
from app.services.auth_service import StudentAuthService
from app.services.resume_analyzer import extract_text_from_docx, extract_text_from_pdf, analyze_resume_with_gemini
from app.utils import limiter  

router = APIRouter(
    prefix="/student",
    tags=["Student Management"],
)

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(student_data: CreateStudent, db: Session = Depends(get_db)):
    auth_service = StudentAuthService(db)
    return auth_service.register_Student(student_data)

@router.post("/signin", response_model=Token, status_code=status.HTTP_200_OK)
async def signin(response: Response, student_data: StudentLogin, db: Session = Depends(get_db)):
    auth_service = StudentAuthService(db)
    token = auth_service.student_login(data=student_data)

    response.set_cookie(
        key="access_token",
        value=f"Bearer {token.access_token}",
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=24 * 60 * 60
    )
    return token

@router.post("/analyze-resume")
@limiter.limit("1/15minute")  # rate limiter
async def analyze_resume(request: Request, file: UploadFile = File(...)):
    if file.content_type not in [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]:
        raise HTTPException(status_code=400, detail="Unsupported file type. Please upload a PDF or Word document.")

    if file.content_type == "application/pdf":
        resume_text = extract_text_from_pdf(file)
    else:
        resume_text = extract_text_from_docx(file)

    analysis = await analyze_resume_with_gemini(resume_text)

    return JSONResponse(content={
        "filename": file.filename,
        "analysis": analysis
    })