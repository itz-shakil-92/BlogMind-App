from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
from bson import ObjectId
from app.models.user import PyObjectId

class ViewEvent(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    blog_id: PyObjectId
    user_id: Optional[PyObjectId] = None
    ip_address: str
    user_agent: str
    referrer: Optional[str] = None
    country: Optional[str] = None
    device: Optional[str] = None
    read_percentage: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}