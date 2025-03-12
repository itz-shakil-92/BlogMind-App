from fastapi import APIRouter, Depends, HTTPException, Request, status, Query
from typing import Optional
from app.dependencies import get_current_active_user, get_optional_user
from app.schemas.user import UserInDB
from app.schemas.analytics import PostAnalytics, UserAnalytics
from app.services.analytics import record_view, update_read_percentage, get_post_analytics, get_user_analytics
from app.services.blog import get_blog_by_slug

router = APIRouter()


@router.post("/view/{slug}", status_code=status.HTTP_200_OK)
async def record_blog_view(
        slug: str,
        request: Request,
        referrer: Optional[str] = None,
        country: Optional[str] = None,
        device: Optional[str] = None,
        current_user: Optional[UserInDB] = Depends(get_optional_user)
):
    """Record a blog view"""
    blog = await get_blog_by_slug(slug)
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found"
        )

    # Get client IP and user agent
    ip_address = request.client.host
    user_agent = request.headers.get("user-agent", "")

    # Record view
    await record_view(
        blog_id=blog.id,
        user_id=current_user.id if current_user else None,
        ip_address=ip_address,
        user_agent=user_agent,
        referrer=referrer,
        country=country,
        device=device
    )

    return {"message": "View recorded successfully"}


@router.post("/read-progress/{slug}", status_code=status.HTTP_200_OK)
async def record_read_progress(
        slug: str,
        request: Request,
        read_percentage: int,
        current_user: Optional[UserInDB] = Depends(get_optional_user)
):
    """Record reading progress for a blog post"""
    blog = await get_blog_by_slug(slug)
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found"
        )

    # Get client IP
    ip_address = request.client.host

    # Update read percentage
    await update_read_percentage(
        blog_id=blog.id,
        user_id=current_user.id if current_user else None,
        ip_address=ip_address,
        read_percentage=read_percentage
    )

    return {"message": "Read progress recorded successfully"}


@router.get("/blog/{slug}", response_model=PostAnalytics)
async def get_blog_analytics(
        slug: str,
        days: int = Query(30, ge=1, le=365),
        current_user: UserInDB = Depends(get_current_active_user)
):
    """Get analytics for a specific blog post"""
    blog = await get_blog_by_slug(slug)
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found"
        )

    # Check if user is the author
    if blog.author.id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view these analytics"
        )

    analytics = await get_post_analytics(blog.id, days)
    return analytics


@router.get("/user", response_model=UserAnalytics)
async def get_user_analytics_endpoint(
        days: int = Query(30, ge=1, le=365),
        current_user: UserInDB = Depends(get_current_active_user)
):
    """Get analytics for the current user"""
    analytics = await get_user_analytics(current_user.id, days)
    return analytics