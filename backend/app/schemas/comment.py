from pydantic import BaseModel
from datetime import datetime
from app.schemas.user import User

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    blog_id: str

class CommentUpdate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: str
    blog_id: str
    user: User
    created_at: datetime
    updated_at: datetime