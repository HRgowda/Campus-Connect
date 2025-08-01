from .user_schema import CreateStudent, CreateProfessor, UserResponse, Token, StudentLogin, ProfessorLogin, FetchProfessor
from .channel_schema import CreateChannel
from .resource_schema import AddSubject, UploadResource, getSubjectSchema, getResourceSchema
from .feedbackSchema import ProfessorRatingSchema

__all__ = [
  "CreateStudent",
  "CreateProfessor",
  "StudentLogin",
  "ProfessorLogin",
  "UserResponse",
  "Token",
  "CreateChannel",
  "AddSubject",
  "UploadResource",
  "getSubjectSchema",
  "getResourceSchema", 
  "FetchProfessor",
  "ProfessorRatingSchema"
]