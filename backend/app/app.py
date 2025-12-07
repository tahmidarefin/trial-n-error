from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import QuestionCreate, ExamCreate, QuestionSchema, UserCreate, UserSchema, AnswerCreate
from app.db import User, Question, Examination, Answer, ExamState, create_db_and_table, get_async_session
from app.utils import get_hashed_password
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.exc import SQLAlchemyError 
from contextlib import asynccontextmanager
from fastapi.staticfiles import StaticFiles
import os
import uuid
from datetime import datetime, timedelta
import aiofiles
from app.auth import router as auth_router, require_admin, get_current_active_user, get_current_user


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_table()
    yield

app = FastAPI(lifespan=lifespan)
app.include_router(auth_router)

origins = ["*"]

# Adding CORS middleware
app.add_middleware(
    CORSMiddleware, 
    allow_origins=origins, # Specify allowed origins
    allow_credentials=True, # Allow cookies and credentials
    allow_methods=["*"], # Allow all HTTP methods
    allow_headers=["*"], # Allow all headers
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, "static")

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.post('/upload')
async def upload(file: UploadFile = File(...), session: AsyncSession = Depends(get_async_session)):
    try:
        data = await file.read()
        user_id = file.filename.split('_')[0]
        exam_id = file.filename.split('_')[1]
        result = await session.execute(select(ExamState).where(and_(ExamState.user_id == user_id, ExamState.examination_id == exam_id)))
        exam_state = result.scalars().first()
        if exam_state is None:
            return {"detail": "Time is over."}
        filepath = os.path.join('./static/img', file.filename)
        async with aiofiles.open(filepath, "wb") as f:
            await f.write(data)
    except Exception:
        raise HTTPException(status_code=500, detail='Something went wrong!')
    finally:
        await file.close()

    return {"detail": "File uploaded successfully."}

@app.post('/questions')
async def create_question(questions: list[QuestionCreate], session: AsyncSession = Depends(get_async_session)):
    for value in questions:
        question = Question(**value.model_dump())
        session.add(question)
        await session.commit()
    
    return {"message": "Questions saved successfully."}

@app.get('/questions')
async def get_questions(session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(Question)) # return queryset for each query, not specific item
    questions = [row[0] for row in result.all()] # row[0] means first elements of queryset
    questions_data = [ QuestionSchema.model_validate(question).model_dump() for question in questions]

    print(questions_data)
    return {"questions": questions_data}

@app.delete('/questions/{question_id}')
async def delete_question(
    question_id: str, 
    session: AsyncSession = Depends(get_async_session),
):
    id = uuid.UUID(question_id)
    result = await session.execute(select(Question).where(Question.id == id))
    question = result.scalars().first()

    try:
        await session.delete(question)
        await session.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return {"message": "Question was deleted successfully."}

@app.post('/exams')
async def create_exam(exam: ExamCreate, session: AsyncSession = Depends(get_async_session), current_user: UserCreate = Depends(require_admin)):
    exam_dict = exam.model_dump()
    exam_dict['exam_ques'] = []

    examination = Examination(**exam_dict)
    session.add(examination)
    await session.commit()
    await session.refresh(examination)

    user_id = current_user.id
    examination_id = examination.id

    for id in exam.model_dump()['exam_ques']:
        question_id = uuid.UUID(id)
        answer_dict = {
            "question_id": question_id,
            "user_id": user_id,
            "examination_id": examination_id
        }

        answer = Answer(**answer_dict)
        session.add(answer)
        await session.commit()

    return {"message": "Examination created successfully."}

@app.get('/exams/{exam_id}')
async def get_exam(exam_id: str, current_user: UserCreate = Depends(get_current_active_user), session: AsyncSession = Depends(get_async_session)): 
    exam_id = uuid.UUID(exam_id)
    user_id = current_user.id

    result = await session.execute(select(Examination).where(Examination.id == exam_id))
    exam = result.scalars().first()

    ques_list = exam.exam_ques
    exam_dict = {}

    def total_calulated_marks(marks_list):
        marks = 0
        for mark in marks_list:
            marks += mark

        return marks
    
    async def retrieve_result(exam_id, user_id, ques_list):
        result = await session.execute(select(Answer).where(and_(Answer.examination_id == exam_id, Answer.user_id == user_id)))
        ques_list_user = []
        ans_list = [row[0] for row in result.all()]
        for quest in ques_list:
            question = quest
            user_ans = next(ans.answer for ans in ans_list if ans.question_id == quest.id)
            if quest.type in ["single_choice", "multi_choice"]:
                user_ans = user_ans.split(", ")
            question.marks = quest.max_score if quest.correct_answers == user_ans else 0
            question.correct_answers = user_ans
            ques_list_user.append(question)
        exam_dict = {"id": exam_id, "title": exam.title, "duration": exam.duration, "questions": ques_list_user, "total_questions": len(exam.exam_ques), "total_marks": total_marks, "obtained_marks": total_calulated_marks([ques.marks for ques in ques_list_user])}
        return exam_dict
    
    result = await session.execute(select(ExamState).where(and_(ExamState.user_id == current_user.id, ExamState.examination_id == exam_id)))
    exam_state = result.scalars().first()

    total_marks = total_calulated_marks([ques.max_score for ques in ques_list])
    
    if current_user.admin:
        exam_dict = {"id": exam_id, "title": exam.title, "duration": exam.duration, "questions": ques_list, "total_questions": len(exam.exam_ques), "total_marks": total_marks}
        return exam_dict
    elif user_id in [user.id for user in exam.exam_user]:
        return await retrieve_result(exam_id, user_id, ques_list)
            

    ques_list = [{k: v for k, v in QuestionSchema.model_validate(ques).model_dump().items() if k != 'correct_answers' and k != 'complexity'} for ques in ques_list]
    if exam_state is None:
        state_dict = {"user_id": user_id, "examination_id": exam_id, "expires": (datetime.now() + timedelta(minutes=exam.duration)), "ans_state": [''] * len(ques_list)}
        exam_state = ExamState(**state_dict)
        session.add(exam_state)
        await session.commit()
        await session.refresh(exam_state)
    
    exam_dict = {"id": exam_id, "title": exam.title, "duration": exam.duration, "questions": ques_list, "total_marks": len(exam.exam_ques), "total_marks": total_marks, "exam_state": exam_state.ans_state, "expires": exam_state.expires}
    
    return exam_dict

@app.delete('/exams/{exam_id}')
async def delete_exams(exam_id: str, current_exam_state: dict = Depends(require_admin), session: AsyncSession = Depends(get_async_session)): 
    id = uuid.UUID(exam_id)
    result = await session.execute(select(Examination).where(Examination.id == id))
    exam = result.scalars().first()
    await session.delete(exam)
    await session.commit()
    return {"detail": "Examination Deleted."}
        
@app.get('/exams/{exam_id}/answers')
async def get_exams_answers(exam_id: str, current_user: UserCreate = Depends(get_current_active_user), session: AsyncSession = Depends(get_async_session)): 
    result = await session.execute(select(Answer).where(and_(Answer.examination_id == str(exam_id), Answer.user_id == str(current_user.id))))
    answer = result.scalars().all()

    return answer

@app.put('/exams/{exam_id}/temp')
async def update_exam_state(exam_id: str, exam_state: dict, current_user: UserCreate = Depends(get_current_active_user), session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(ExamState).where(and_(ExamState.user_id == current_user.id, ExamState.examination_id == exam_id)))
    state = result.scalars().first()
    state.ans_state = exam_state["ans_state"]
    await session.commit()
    await session.refresh(state)
    
    return state

@app.put('/exams/{exam_id}')
async def update_exam_privacy(exam_id: str, current_user: UserCreate = Depends(require_admin), session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(Examination).where(Examination.id == exam_id))
    exam = result.scalars().first()
    exam.published = not exam.published
    await session.commit()
    await session.refresh(exam)
    
    return {"detail": "Examination privacy updated successfully."}

@app.get('/exams/{exam_id}/users')
async def get_exams_user(exam_id: str, current_user: UserCreate = Depends(require_admin), session: AsyncSession = Depends(get_async_session)): 
    id = uuid.UUID(exam_id)
    result = await session.execute(select(Examination).where(Examination.id == id))
    exam = result.scalars().first()
    users = []

    for user in exam.exam_user:
        if not user.admin:
            users.append({"id": user.id, "full_name": user.full_name})

    return users

@app.get('/exams/{exam_id}/users/{user_id}')
async def get_exam_user(exam_id: str, user_id: str, current_user: UserCreate = Depends(require_admin), session: AsyncSession = Depends(get_async_session)): 
    id = uuid.UUID(user_id)
    result = await session.execute(select(User).where(User.id == id))
    user = result.scalars().first()
        
    return await get_exam(exam_id, user, session)

@app.get('/exams')
async def get_exams(current_user: UserSchema = Depends(get_current_active_user), session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(ExamState))
    exam_states = result.all()

    exam_states = [state[0] for state in exam_states if state[0].expires <= datetime.now()]
    
    for exam_state in exam_states:
        user_id = exam_state.user_id
        exam_id = exam_state.examination_id
        result = await session.execute(select(Examination).where(Examination.id == exam_id))
        exam = result.scalars().first()
        answers = []
        answer = {"user_id": user_id, "examination_id": exam_id}
        for state, ques in zip(exam_state.ans_state, exam.exam_ques):
            answer["question_id"] = ques.id
            answer["answer"] = state
            answer["marks"] = ques.max_score if (ques.type == "single_choice" or ques.type == "multi_choice") and ", ".join(ques.correct_answers) == state else 0
            answers.append(AnswerCreate.model_validate(answer))
        await create_answer(answers, session)
        await session.delete(exam_state)
        await session.commit()

    
    result = await session.execute(select(Examination))
    if not current_user.admin:
        exams = [{"id": row[0].id, "title": row[0].title, "duration": row[0].duration} for row in result.all() if row[0].published]
    else:
        exams = [{"id": row[0].id, "title": row[0].title, "duration": row[0].duration, "published": row[0].published} for row in result.all()]
    
    return exams

@app.get('/running/exams')
async def get_current_exams(current_user: UserSchema = Depends(get_current_active_user), session: AsyncSession = Depends(get_async_session)):
    states = await session.execute(select(ExamState).where(ExamState.user_id == current_user.id))
    result = await session.execute(select(Examination))
    exams = result.all()
    exams_running = states.all()
    exams_result = [{"id": row[0].id, "title": row[0].title, "duration": row[0].duration} for row in exams if row[0].id in [state[0].examination_id for state in exams_running]]
    return exams_result

@app.post('/answers')
async def create_answer(answers: list[AnswerCreate], session: AsyncSession = Depends(get_async_session)):
    for value in answers:
        answer = Answer(**value.model_dump())
        session.add(answer)
        await session.commit()
    
    return {"message": "Answers saved successfully."}

@app.post('/users')
async def register_user(userdata: UserCreate, session: AsyncSession = Depends(get_async_session)):
    user_dict = userdata.model_dump()
    hashed_password = get_hashed_password(user_dict.pop("password"))
    user_dict["hashed_password"] = hashed_password
    user = User(**user_dict)
    try:
        session.add(user)
        await session.commit()
        await session.refresh(user)
        delattr(user, 'hashed_password')
        return {"detail": "Account is created successfully!"}
    except SQLAlchemyError as e:
        return {"detail": "Unexpected Error! Try again with Unique email."}

@app.put('/user/activate')
async def activate_user(current_user: UserSchema = Depends(get_current_user), session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(User).where(User.id == current_user.id))
    user = result.scalars().first()
    setattr(user, "disabled", False)
    await session.commit()
    await session.refresh(user)
    delattr(user, 'hashed_password')
    return user

@app.put('/activate/admin')
async def make_admin(current_user: UserSchema = Depends(get_current_active_user), session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(User).where(User.id == current_user.id))
    user = result.scalars().first()
    setattr(user, "admin", True)
    await session.commit()
    await session.refresh(user)
    delattr(user, 'hashed_password')
    return user

