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

@router.get("/myfeedbacks")
def getFeedBacks(professorId: str, db: Session = Depends(get_db)):
  myFeedback = Feedback(db)
  return myFeedback.getFeedback(professorId)