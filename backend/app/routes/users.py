from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.user import User, UserUpdate
from app.schemas.blog import BlogResponse
from app.services.user import get_user_by_id, update_user
from app.services.blog import get_user_blogs, get_liked_blogs
from app.services.comment import get_user_comments
from app.dependencies import get_current_active_user
from app.schemas.user import UserInDB
from typing import List
from bson import ObjectId

router = APIRouter()


@router.get("/me", response_model=User)
async def read_users_me(current_user: UserInDB = Depends(get_current_active_user)):
    """Get current user"""
    return current_user


@router.put("/me", response_model=User)
async def update_user_me(
        user_update: UserUpdate,
        current_user: UserInDB = Depends(get_current_active_user)
):
    """Update current user"""
    updated_user = await update_user(current_user.id, user_update)
    return updated_user


@router.get("/blogs", response_model=List[BlogResponse])
async def read_user_blogs(current_user: UserInDB = Depends(get_current_active_user)):
    """Get blogs by current user"""
    blogs = await get_user_blogs(str(current_user.id))
    return blogs


@router.get("/liked", response_model=List[BlogResponse])
async def read_liked_blogs(current_user: UserInDB = Depends(get_current_active_user)):
    """Get blogs liked by current user"""
    blogs = await get_liked_blogs(str(current_user.id))
    return blogs


@router.get("/comments", response_model=List[dict])
async def read_user_comments(current_user: UserInDB = Depends(get_current_active_user)):
    """Get comments by current user"""
    comments = await get_user_comments(str(current_user.id))

    # Add blog title to each comment
    from app.main import app
    db = app.mongodb

    result = []
    for comment in comments:
        blog = await db.blogs.find_one({"_id": ObjectId(comment.blog_id)})
        if blog:
            result.append({
                "id": comment.id,
                "content": comment.content,
                "created_at": comment.created_at,
                "blog": {
                    "id": comment.blog_id,
                    "title": blog["title"],
                    "slug": blog["slug"]
                }
            })

    return result