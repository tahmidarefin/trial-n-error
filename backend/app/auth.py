from dotenv import load_dotenv
import os
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db import get_async_session, User
from app.schemas import UserSchema, TokenData, TokenCreate
from app.utils import verify_password

load_dotenv()
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 200

router = APIRouter(prefix='/auth', tags=['auth'])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")
  
async def get_user_by_email(email: str, session: AsyncSession):
  result = await session.execute(select(User).where(User.email==email))
  return result.scalar_one_or_none()
  
async def authenticate_user(email: str, password: str, session: AsyncSession):
  user = await get_user_by_email(email, session)
  if not user:
    return None
  if not verify_password(password, user.hashed_password):
    return None
  delattr(user, 'hashed_password')
  return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
  to_encode = data.copy()
  if expires_delta:
    expire = datetime.now(timezone.utc) + expires_delta
  else:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
  
  to_encode.update({"exp": expire})
  encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)

  return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), session: AsyncSession = Depends(get_async_session)):
  credential_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
  try:
    payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
    email = payload.get("sub")
    if email is None:
      raise credential_exception
    token_data = TokenData(email=email)
  except:
    raise credential_exception
  
  user = await get_user_by_email(token_data.email, session)
  if user is None:
    raise credential_exception
  
  return user

async def get_current_active_user(current_user: UserSchema = Depends(get_current_user)):
  if current_user.disabled:
    raise HTTPException(status_code=400, detail="Inactive User", headers={"WWW-Authenticate": "Bearer"})
  return current_user
  
async def require_admin(user: UserSchema = Depends(get_current_active_user)):
  if user.admin is not True:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
  return user

@router.post("/token", response_model=TokenCreate)
async def login_for_access_token(form_data = Depends(OAuth2PasswordRequestForm), session: AsyncSession = Depends(get_async_session)):
  user = await authenticate_user(form_data.username, form_data.password, session)
  if user is None:
      raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
  
  access_token = create_access_token(
      data={"sub": user.email}
  )
  return {"access_token": access_token, "token_type": "bearer"}

@router.get('/user/me')
async def read_current_user(current_user: UserSchema = Depends(get_current_active_user)):
    delattr(current_user, 'hashed_password')
    return current_user
