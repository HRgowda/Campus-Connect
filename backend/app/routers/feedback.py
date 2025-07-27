from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.repository import Feedback
from app.database import get_db
from app.schemas import ProfessorRatingSchema

router = APIRouter(
  prefix="",
  tags=["Feedback Portal"]
)

@router.post("/give_feedback")
def giveFeedback(feedback_data: ProfessorRatingSchema, db: Session = Depends(get_db)):
  feedback = Feedback(db)
  return feedback.addFeedback(feedback_data)
