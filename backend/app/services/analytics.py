from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from bson import ObjectId
from fastapi import FastAPI
from app.schemas.analytics import PostAnalytics, UserAnalytics, TimelinePoint, SourceData, DeviceData, CountryData


async def record_view(
        blog_id: str,
        user_id: Optional[str],
        ip_address: str,
        user_agent: str,
        referrer: Optional[str] = None,
        country: Optional[str] = None,
        device: Optional[str] = None
) -> bool:
    from app.main import app
    db = app.mongodb

    # Create view event
    view_event = {
        "blog_id": ObjectId(blog_id),
        "user_id": ObjectId(user_id) if user_id else None,
        "ip_address": ip_address,
        "user_agent": user_agent,
        "referrer": referrer,
        "country": country,
        "device": device,
        "created_at": datetime.utcnow()
    }

    # Insert view event
    await db.view_events.insert_one(view_event)

    # Update blog views count
    await db.blogs.update_one(
        {"_id": ObjectId(blog_id)},
        {"$inc": {"views_count": 1}}
    )

    return True


async def update_read_percentage(
        blog_id: str,
        user_id: Optional[str],
        ip_address: str,
        read_percentage: int
) -> bool:
    from app.main import app
    db = app.mongodb

    # Find the most recent view event for this blog and user/IP
    query = {
        "blog_id": ObjectId(blog_id),
        "ip_address": ip_address
    }

    if user_id:
        query["user_id"] = ObjectId(user_id)

    view_event = await db.view_events.find_one(
        query,
        sort=[("created_at", -1)]
    )

    if view_event:
        # Update read percentage
        await db.view_events.update_one(
            {"_id": view_event["_id"]},
            {"$set": {"read_percentage": read_percentage}}
        )
        return True

    return False


async def get_post_analytics(blog_id: str, days: int = 30) -> PostAnalytics:
    from app.main import app
    db = app.mongodb

    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)

    # Get blog
    blog = await db.blogs.find_one({"_id": ObjectId(blog_id)})
    if not blog:
        return None

    # Get view events for this blog
    view_events = await db.view_events.find({
        "blog_id": ObjectId(blog_id),
        "created_at": {"$gte": start_date, "$lte": end_date}
    }).to_list(length=None)

    # Get likes for this blog
    likes = await db.likes.find({
        "blog_id": ObjectId(blog_id),
        "created_at": {"$gte": start_date, "$lte": end_date}
    }).to_list(length=None)

    # Get comments for this blog
    comments = await db.comments.find({
        "blog_id": ObjectId(blog_id),
        "created_at": {"$gte": start_date, "$lte": end_date}
    }).to_list(length=None)

    # Generate timeline data
    views_timeline = generate_timeline(view_events, start_date, end_date)
    likes_timeline = generate_timeline(likes, start_date, end_date)
    comments_timeline = generate_timeline(comments, start_date, start_date, end_date)
    comments_timeline = generate_timeline(comments, start_date, end_date)

    # Calculate sources
    sources = {}
    for event in view_events:
        referrer = event.get("referrer", "direct")
        if not referrer:
            referrer = "direct"

        # Extract domain from referrer
        if referrer != "direct":
            from urllib.parse import urlparse
            try:
                domain = urlparse(referrer).netloc
                referrer = domain if domain else "direct"
            except:
                referrer = "direct"

        sources[referrer] = sources.get(referrer, 0) + 1

    sources_data = [SourceData(source=source, count=count) for source, count in sources.items()]

    # Calculate devices

    devices = {}
    for event in view_events:
        device = event.get("device") or "unknown"  # Ensure a fallback value
        devices[device] = devices.get(device, 0) + 1

    devices_data = [DeviceData(device=str(device), count=count) for device, count in devices.items()]
    # Calculate countries
    countries = {}
    for event in view_events:
        country = event.get("country", "unknown")
        countries[country] = countries.get(country, 0) + 1

    countries_data = [
        CountryData(country=country, count=count)
        for country, count in countries.items()
        if country is not None
    ]

    # Calculate read time
    read_percentages = [event.get("read_percentage", 0) for event in view_events if "read_percentage" in event]
    avg_read_percentage = sum(read_percentages) / len(read_percentages) if read_percentages else 0

    completion_count = sum(1 for p in read_percentages if p >= 80)
    completion_rate = (completion_count / len(read_percentages) * 100) if read_percentages else 0

    return PostAnalytics(
        views={
            "total": len(view_events),
            "timeline": views_timeline
        },
        likes={
            "total": len(likes),
            "timeline": likes_timeline
        },
        comments={
            "total": len(comments),
            "timeline": comments_timeline
        },
        sources=sources_data,
        devices=devices_data,
        countries=countries_data,
        read_time={
            "average_percentage": avg_read_percentage,
            "completion_rate": completion_rate
        }
    )


async def get_user_analytics(user_id: str, days: int = 30) -> UserAnalytics:
    from app.main import app
    db = app.mongodb

    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)

    # Get user's blogs
    blogs = await db.blogs.find({
        "author_id": user_id   #author_id in blog is string
    }).to_list(length=None)

    blog_ids = [blog["_id"] for blog in blogs]

    if not blog_ids:
        return UserAnalytics(
            total_posts=0,
            total_views=0,
            total_likes=0,
            total_comments=0,
            posts_timeline=[],
            views_timeline=[],
            likes_timeline=[],
            comments_timeline=[],
            top_posts=[]
        )

    # Get view events for user's blogs
    view_events = await db.view_events.find({
        "blog_id": {"$in": blog_ids},
        "created_at": {"$gte": start_date, "$lte": end_date}
    }).to_list(length=None)

    # Get likes for user's blogs
    likes = await db.likes.find({
        "blog_id": {"$in": blog_ids},
        "created_at": {"$gte": start_date, "$lte": end_date}
    }).to_list(length=None)

    # Get comments for user's blogs
    comments = await db.comments.find({
        "blog_id": str({"$in": (blog_ids)}),
        "created_at": {"$gte": start_date, "$lte": end_date}
    }).to_list(length=None)

    # Generate timeline data
    posts_timeline = generate_timeline(blogs, start_date, end_date, "published_at")
    views_timeline = generate_timeline(view_events, start_date, end_date)
    likes_timeline = generate_timeline(likes, start_date, end_date)
    comments_timeline = generate_timeline(comments, start_date, end_date)

    # Calculate top posts
    top_posts = []
    for blog in blogs:
        blog_views = sum(1 for event in view_events if event["blog_id"] == blog["_id"])
        blog_likes = sum(1 for like in likes if like["blog_id"] == blog["_id"])
        blog_comments = sum(1 for comment in comments if comment["blog_id"] == blog["_id"])

        top_posts.append({
            "id": str(blog["_id"]),
            "title": blog["title"],
            "slug": blog["slug"],
            "views": blog_views,
            "likes": blog_likes,
            "comments": blog_comments,
            "published_at": blog.get("published_at", blog["created_at"])
        })

    # Sort top posts by views
    top_posts.sort(key=lambda x: x["views"], reverse=True)

    return UserAnalytics(
        total_posts=len(blogs),
        total_views=len(view_events),
        total_likes=len(likes),
        total_comments=len(comments),
        posts_timeline=posts_timeline,
        views_timeline=views_timeline,
        likes_timeline=likes_timeline,
        comments_timeline=comments_timeline,
        top_posts=top_posts[:5]  # Return top 5 posts
    )


def generate_timeline(events, start_date, end_date, date_field="created_at"):
    """Generate a timeline of counts by day"""
    # Create a dictionary of dates
    timeline = {}
    current_date = start_date
    while current_date <= end_date:
        date_str = current_date.strftime("%Y-%m-%d")
        timeline[date_str] = 0
        current_date += timedelta(days=1)

    # Count events by day
    for event in events:
        event_date = event[date_field]
        date_str = event_date.strftime("%Y-%m-%d")
        if date_str in timeline:
            timeline[date_str] += 1

    # Convert to list of TimelinePoint objects
    return [TimelinePoint(date=date, count=count) for date, count in timeline.items()]