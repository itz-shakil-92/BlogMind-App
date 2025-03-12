from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.user import UserCreate, Token
from app.services.auth import register_user, authenticate_user

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate):
    """Register a new user"""
    user = await register_user(user_in)

    # Authenticate user after registration
    token = await authenticate_user(user_in.email, user_in.password)
    return token


@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login and get access token"""
    token = await authenticate_user(form_data.username, form_data.password)
    return token


