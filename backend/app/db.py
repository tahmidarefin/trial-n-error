from dotenv import load_dotenv
import os
import uuid
from collections.abc import AsyncGenerator

from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base, relationship


load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

Base = declarative_base()

class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    complexity = Column(Integer, nullable=False)
    type = Column(String, nullable=False)
    options = Column(String)
    correct_answers = Column(ARRAY(String))
    max_score = Column(Integer, default=1)

    ques_exam = relationship("Examination", secondary="answers", back_populates="exam_ques", lazy="selectin")

class Examination(Base):
    __tablename__ = "examinations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    duration = Column(Integer, default=1)
    published = Column(Boolean, default=False)

    exam_user = relationship("User", secondary="answers", back_populates="user_exam", lazy="selectin")
    exam_ques = relationship("Question", secondary="answers", back_populates="ques_exam", lazy="selectin")

class ExamState(Base):
    __tablename__ = "exam_state"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    examination_id = Column(UUID(as_uuid=True), ForeignKey("examinations.id", ondelete="CASCADE"), primary_key=True)
    expires = Column(DateTime, nullable=False)
    ans_state = Column(ARRAY(String), nullable=True)

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    admin = Column(Boolean, default=False)
    disabled = Column(Boolean, default=True)

    user_exam = relationship("Examination", secondary="answers", back_populates="exam_user", lazy="selectin")

    
# It is the association table, that's where relational magic happens like charm (many-to-many)
# It sucks earlier, as not know uses of secondary table
class Answer(Base):
    __tablename__ = "answers"
    
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"),  primary_key=True)
    examination_id = Column(UUID(as_uuid=True), ForeignKey("examinations.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)

    answer = Column(String, nullable=True)
    marks = Column(Integer, default=0)

engine = create_async_engine(
    DATABASE_URL,
    echo=True,  # False in production
    future=True
)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)

async def create_db_and_table():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
