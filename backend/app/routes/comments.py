from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.comment import CommentCreate, CommentUpdate, CommentResponse
from app.services.comment import create_comment, update_comment, delete_comment, get_blog_comments
from app.dependencies import get_current_active_user
from app.schemas.user import UserInDB
from bson import ObjectId

router = APIRouter()

@router.post("", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment_endpoint(
    comment_in: CommentCreate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Create a new comment"""
    comment = await create_comment(comment_in, current_user.id)
    return comment

@router.get("/blog/{blog_id}", response_model=List[CommentResponse])
async def read_blog_comments(blog_id: str):
    """Get all comments for a blog post"""
    comments = await get_blog_comments(blog_id)
    return comments

@router.put("/{comment_id}", response_model=CommentResponse)
async def update_comment_endpoint(
    comment_id: str,
    comment_update: CommentUpdate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Update a comment"""
    comment = await update_comment(comment_id, comment_update, current_user.id)
    return comment

@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment_endpoint(
    comment_id: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Delete a comment"""
    await delete_comment(comment_id, current_user.id)
    return None