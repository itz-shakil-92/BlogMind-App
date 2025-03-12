from fastapi import HTTPException, status
from app.schemas.user import UserUpdate, User
from bson import ObjectId
from datetime import datetime


async def get_user_by_id(user_id: str) -> User:
    from app.main import app
    db = app.mongodb

    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return User(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        bio=user.get("bio", ""),
        avatar=user.get("avatar", None),
        created_at=user.get("created_at"),
        updated_at=user.get("updated_at")
    )


async def update_user(user_id: str, user_update: UserUpdate) -> User:
    from app.main import app
    db = app.mongodb

    # Check if user exists
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Prepare update data
    update_data = {k: v for k, v in user_update.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()

        # Update user
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )

    # Get updated user
    updated_user = await db.users.find_one({"_id": ObjectId(user_id)})

    return User(
        id=str(updated_user["_id"]),
        name=updated_user["name"],
        email=updated_user["email"],
        bio=updated_user.get("bio", ""),
        avatar=updated_user.get("avatar", None),
        created_at=updated_user.get("created_at"),
        updated_at=updated_user.get("updated_at")
    )


async def update_user_avatar(user_id: str, avatar_path: str) -> bool:
    from app.main import app
    db = app.mongodb

    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"avatar": avatar_path, "updated_at": datetime.utcnow()}}
    )

    return result.modified_count > 0