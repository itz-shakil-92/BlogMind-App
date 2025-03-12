from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from app.schemas.user import User

class CategoryBase(BaseModel):
    name: str
    slug: str

class Category(CategoryBase):
    id: str

class TagBase(BaseModel):
    name: str
    slug: str

class Tag(TagBase):
    id: str

class BlogBase(BaseModel):
    title: str
    content: str
    excerpt: str
    category_id: str
    tags: List[str] = []
    cover_image: Optional[str] = None
    published: bool = True

class BlogCreate(BlogBase):
    pass

class BlogUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    category_id: Optional[str] = None
    tags: Optional[List[str]] = None
    cover_image: Optional[str] = None
    published: Optional[bool] = None

class BlogResponse(BlogBase):
    id: str
    slug: str
    author: User
    category: Category
    views_count: int
    likes_count: int
    comments_count: int
    is_liked: bool = False
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class LikeResponse(BaseModel):
    blog_id: str
    user_id: str
    created_at: datetime
