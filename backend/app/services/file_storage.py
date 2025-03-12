import os
import shutil
import uuid
from datetime import datetime
from typing import Optional
from fastapi import UploadFile
from PIL import Image
import aiofiles
from app.config import settings

# Create upload directories if they don't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "avatars"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "blog_images"), exist_ok=True)


async def save_upload_file(upload_file: UploadFile, folder: str) -> Optional[str]:
    """Save an uploaded file to the specified folder and return the filename"""
    if not upload_file:
        return None

    # Generate a unique filename
    file_extension = os.path.splitext(upload_file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"

    # Create the full path
    file_path = os.path.join(settings.UPLOAD_DIR, folder, unique_filename)

    try:
        # Save the file
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await upload_file.read()
            await out_file.write(content)

        # Return the relative path
        return f"{folder}/{unique_filename}"
    except Exception as e:
        print(f"Error saving file: {e}")
        return None


async def save_avatar(upload_file: UploadFile) -> Optional[str]:
    """Save an avatar image with resizing"""
    if not upload_file:
        return None

    # Check if the file is an image
    content_type = upload_file.content_type
    if not content_type.startswith("image/"):
        return None

    # Generate a unique filename
    file_extension = os.path.splitext(upload_file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"

    # Create the full path
    file_path = os.path.join(settings.UPLOAD_DIR, "avatars", unique_filename)

    try:
        # Save the file temporarily
        temp_path = os.path.join(settings.UPLOAD_DIR, "temp_avatar")
        async with aiofiles.open(temp_path, 'wb') as out_file:
            content = await upload_file.read()
            await out_file.write(content)

        # Resize the image
        with Image.open(temp_path) as img:
            img = img.convert('RGB')
            img.thumbnail((200, 200))  # Resize to 200x200 max
            img.save(file_path)

        # Remove the temporary file
        os.remove(temp_path)

        # Return the relative path
        return f"avatars/{unique_filename}"
    except Exception as e:
        print(f"Error saving avatar: {e}")
        return None


async def save_blog_image(upload_file: UploadFile) -> Optional[str]:
    """Save a blog image with resizing"""
    if not upload_file:
        return None

    # Check if the file is an image
    content_type = upload_file.content_type
    if not content_type.startswith("image/"):
        return None

    # Generate a unique filename
    file_extension = os.path.splitext(upload_file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"

    # Create the full path
    file_path = os.path.join(settings.UPLOAD_DIR, "blog_images", unique_filename)

    try:
        # Save the file temporarily
        temp_path = os.path.join(settings.UPLOAD_DIR, "temp_blog_image")
        async with aiofiles.open(temp_path, 'wb') as out_file:
            content = await upload_file.read()
            await out_file.write(content)

        # Resize the image
        with Image.open(temp_path) as img:
            img = img.convert('RGB')
            img.thumbnail((1200, 1200))  # Resize to 1200x1200 max
            img.save(file_path)

        # Remove the temporary file
        os.remove(temp_path)

        # Return the relative path
        return f"blog_images/{unique_filename}"
    except Exception as e:
        print(f"Error saving blog image: {e}")
        return None


def get_file_url(file_path: Optional[str]) -> Optional[str]:
    """Convert a file path to a URL"""
    if not file_path:
        return None

    return f"{settings.API_URL}/uploads/{file_path}"