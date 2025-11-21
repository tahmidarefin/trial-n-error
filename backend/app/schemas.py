from pydantic import BaseModel
from typing import ClassVar
from uuid import UUID
from datetime import datetime

class QuestionOut(BaseModel):
    title: str
    complexity: int
    type: str
    options: str
    max_score: int

    class Config:
        from_attributes = True

class QuestionCreate(QuestionOut):
    correct_answers: list = []
    
    class Config:
        from_attributes = True

class QuestionSchema(QuestionCreate):
    id: UUID

    class Config:
        from_attributes = True

class ExamCreate(BaseModel):
    title: str
    duration: int
    exam_ques: list = []

    class Config:
        from_attributes = True

class ExamStateCreate(BaseModel):
    user_id: UUID
    expires: datetime
    ans_state: list = []

    class Config:
        from_attributes = True

class ExamSchema(ExamCreate):
    id: UUID

    class Config:
        from_attributes = True

class ExamOut(ExamCreate):
    user_list: list = []

    class Config:
        from_attributes = True

class AnswersList(BaseModel):
    question_id: UUID
    examination_id: UUID
    user_id: UUID
    answers: list = []

    class Config:
        from_attributes = True

class AnswerCreate(BaseModel):
    question_id: UUID
    examination_id: UUID
    user_id: UUID
    answer: str

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str | None

    class Config:
        from_attributes = True

class UserSchema(UserCreate):
    admin: bool
    disabled: bool

    class Config:
        from_attributes = True

class TokenCreate(BaseModel):
    access_token: str
    token_type: str

    class Config:
        from_attributes = True

class TokenData(BaseModel):
    email: str

    class Config:
        from_attributes = True


