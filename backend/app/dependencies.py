from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from bson import ObjectId
from app.config import settings
from app.schemas.user import TokenData, UserInDB
from typing import Optional

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


async def get_user_by_id(user_id: str):
    from app.main import app
    db = app.mongodb
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if user:
        user["id"] = str(user.pop("_id"))  # Convert ObjectId to string and rename _id -> id
        return UserInDB(**user)
    return None


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except JWTError:
        raise credentials_exception

    user = await get_user_by_id(token_data.user_id)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(current_user: UserInDB = Depends(get_current_user)):
    return current_user


async def get_optional_user(token: Optional[str] = Depends(oauth2_scheme)):
    if token:
        try:
            return await get_current_user(token)
        except HTTPException:
            return None
    return None