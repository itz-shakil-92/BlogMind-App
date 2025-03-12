from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
import os
from app.dependencies import get_current_active_user
from app.schemas.user import UserInDB
from app.services.file_storage import save_avatar, save_blog_image
from app.services.user import update_user_avatar
from app.config import settings

router = APIRouter()


@router.post("/avatar", status_code=status.HTTP_200_OK)

async def upload_avatar(
        file: UploadFile = File(...),
        current_user: UserInDB = Depends(get_current_active_user)
):
    """Upload a user avatar"""
    avatar_path = await save_avatar(file)
    if not avatar_path:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to save avatar"
        )

    # Update user avatar in database
    success = await update_user_avatar(current_user.id, avatar_path)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update user avatar"
        )

    return {
        "avatar_url": f"{settings.API_URL}/uploads/{avatar_path}"
    }


@router.post("/blog-image", status_code=status.HTTP_200_OK)
async def upload_blog_image(
        file: UploadFile = File(...),
        current_user: UserInDB = Depends(get_current_active_user)
):
    """Upload a blog image"""
    image_path = await save_blog_image(file)
    if not image_path:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to save image"
        )

    return {
        "image_url": f"{settings.API_URL}/uploads/{image_path}"
    }


@router.get("/{folder}/{filename}", status_code=status.HTTP_200_OK)
async def get_upload(folder: str, filename: str):
    """Get an uploaded file"""
    file_path = os.path.join(settings.UPLOAD_DIR, folder, filename)
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    return FileResponse(file_path)