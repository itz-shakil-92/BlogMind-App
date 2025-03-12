from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from app.schemas.blog import BlogCreate, BlogUpdate, BlogResponse, Category
from app.services.blog import (
    create_blog, update_blog, delete_blog, get_blog_by_slug,
    get_blogs, like_blog, get_categories
)
from app.dependencies import get_current_active_user, get_optional_user
from app.schemas.user import UserInDB

router = APIRouter()

@router.post("", response_model=BlogResponse, status_code=status.HTTP_201_CREATED)
async def create_blog_post(
    blog_in: BlogCreate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Create a new blog post"""
    blog = await create_blog(blog_in, current_user.id)
    return blog

@router.get("", response_model=List[BlogResponse])
async def read_blogs(
    search: Optional[str] = None,
    category: Optional[str] = None,
    tag: Optional[str] = None,
    sort: Optional[str] = "desc",
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: Optional[UserInDB] = Depends(get_optional_user)
):
    """Get all blogs with optional filtering"""
    blogs = await get_blogs(
        search=search,
        category=category,
        tag=tag,
        sort=sort,
        skip=skip,
        limit=limit,
        user_id=current_user.id if current_user else None
    )
    return blogs

@router.get("/categories", response_model=List[Category])
async def read_categories():
    """Get all categories"""
    categories = await get_categories()
    return categories

@router.get("/{slug}", response_model=BlogResponse)
async def read_blog(
    slug: str,
    current_user: Optional[UserInDB] = Depends(get_optional_user)
):
    """Get a blog post by slug"""
    blog = await get_blog_by_slug(slug, current_user.id if current_user else None)
    return blog

@router.put("/{blog_id}", response_model=BlogResponse)
async def update_blog_post(
    blog_id: str,
    blog_update: BlogUpdate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Update a blog post"""
    blog = await update_blog(blog_id, blog_update, current_user.id)
    return blog

@router.delete("/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blog_post(
    blog_id: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Delete a blog post"""
    await delete_blog(blog_id, current_user.id)
    return None

@router.post("/{slug}/like", status_code=status.HTTP_200_OK)
async def like_blog_post(
    slug: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Like or unlike a blog post"""
    await like_blog(slug, current_user.id)
    return {"message": "Blog like status updated"}