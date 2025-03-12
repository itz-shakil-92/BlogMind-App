from fastapi import HTTPException, status
from datetime import datetime, timedelta
from app.schemas.user import UserCreate, User, Token
from app.models.user import UserModel
from app.utils.security import get_password_hash, verify_password, create_access_token
from app.config import settings
from bson import ObjectId


async def register_user(user_in: UserCreate) -> User:
    from app.main import app
    db = app.mongodb

    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_in.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    hashed_password = get_password_hash(user_in.password)
    user_model = UserModel(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hashed_password,
        bio=user_in.bio,
        avatar=user_in.avatar
    )

    result = await db.users.insert_one(user_model.dict(by_alias=True))

    # Send welcome email
    try:
        from app.services.email import send_welcome_email
        await send_welcome_email(user_in.email, user_in.name)
    except Exception as e:
        print(f"Failed to send welcome email: {e}")

    return User(
        id=str(result.inserted_id),
        email=user_in.email,
        name=user_in.name,
        bio=user_in.bio,
        avatar=user_in.avatar
    )


async def authenticate_user(email: str, password: str) -> Token:
    from app.main import app
    db = app.mongodb

    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    if not verify_password(password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Create access token
    access_token = create_access_token(str(user["_id"]))

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=User(
            id=str(user["_id"]),
            name=user["name"],
            email=user["email"],
            bio=user.get("bio", ""),
            avatar=user.get("avatar", None)
        )
    )