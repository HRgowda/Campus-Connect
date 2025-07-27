from pydantic import BaseModel

class ProfessorRatingSchema(BaseModel):
  
  rating: int
  professorId: str
  studentId: str