from typing import List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class TimelinePoint(BaseModel):
    date: str
    count: int

class SourceData(BaseModel):
    source: str
    count: int

class DeviceData(BaseModel):
    device: str
    count: int

class CountryData(BaseModel):
    country: str
    count: int

class PostAnalytics(BaseModel):
    views: Dict[str, Any]
    likes: Dict[str, Any]
    comments: Dict[str, Any]
    sources: List[SourceData]
    devices: List[DeviceData]
    countries: List[CountryData]
    read_time: Dict[str, Any]

class UserAnalytics(BaseModel):
    total_posts: int
    total_views: int
    total_likes: int
    total_comments: int
    posts_timeline: List[TimelinePoint]
    views_timeline: List[TimelinePoint]
    likes_timeline: List[TimelinePoint]
    comments_timeline: List[TimelinePoint]
    top_posts: List[Dict[str, Any]]