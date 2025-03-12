from fastapi import HTTPException, status
from typing import List, Optional
from app.schemas.blog import BlogCreate, BlogUpdate, BlogResponse, Category
from app.schemas.user import User
from app.models.blog import BlogModel
from app.utils.slugify import slugify
from bson import ObjectId

from datetime import datetime


async def create_blog(blog_in: BlogCreate, author_id: str) -> BlogResponse:
    from app.main import app
    db = app.mongodb

    try:
        category_id = ObjectId(blog_in.category_id)  # Ensure it's a valid ObjectId

    except Exception as e:
        raise ValueError(f"Invalid category_id: {blog_in.category_id}") from e

    # Check if category exists
    category = await db.categories.find_one({"_id": category_id})
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category not found"
        )

    # Generate slug
    base_slug = slugify(blog_in.title)
    slug = base_slug

    # Check if slug already exists
    count = 1
    while await db.blogs.find_one({"slug": slug}):
        slug = f"{base_slug}-{count}"
        count += 1

    # Create blog
    published_at = datetime.utcnow() if blog_in.published else None

    # Get author
    # Fetch author details
    author = await db.users.find_one({"_id": ObjectId(author_id)})
    if not author:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Author not found"
        )

    blog_model = BlogModel(
        title=blog_in.title,
        slug=slug,
        content=blog_in.content,
        excerpt=blog_in.excerpt,
        author_id=author_id,
        category_id=blog_in.category_id,
        tags=blog_in.tags,
        cover_image=blog_in.cover_image,
        published=blog_in.published,
        published_at=published_at
    )

    result = await db.blogs.insert_one(blog_model.model_dump(by_alias=True))

    #create blogresponse

    blogresponse = BlogResponse(
        id=str(result.inserted_id),
        title=blog_in.title,
        slug=slug,
        content=blog_in.content,
        excerpt=blog_in.excerpt,
        author=User(
            id=str(author["_id"]),
            name=author["name"],
            email=author["email"],
            bio=author.get("bio", ""),
            avatar=author.get("avatar", None)
        ),
        category_id=str(category["_id"]),
        category=Category(
            id=str(category["_id"]),
            name=category["name"],
            slug=category["slug"]
        ),
        tags=blog_in.tags,
        cover_image=blog_in.cover_image,
        published=blog_in.published,
        views_count=0,
        likes_count=0,
        comments_count=0,
        published_at=published_at,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    return blogresponse


async def update_blog(blog_id: str, blog_update: BlogUpdate, author_id: str) -> BlogResponse:
    from app.main import app
    db = app.mongodb

    # Check if blog exists and user is the author
    blog = await db.blogs.find_one({"_id": ObjectId(blog_id)})
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found"
        )

    if blog["author_id"] != author_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this blog"
        )

    # Prepare update data
    update_data = {k: v for k, v in blog_update.dict().items() if v is not None}

    # Update slug if title is changed
    if "title" in update_data:
        base_slug = slugify(update_data["title"])
        slug = base_slug

        # Check if slug already exists (excluding current blog)
        count = 1
        while await db.blogs.find_one({"slug": slug, "_id": {"$ne": ObjectId(blog_id)}}):
            slug = f"{base_slug}-{count}"
            count += 1

        update_data["slug"] = slug

    # Update published_at if published status changes
    if "published" in update_data and update_data["published"] and not blog.get("published_at"):
        update_data["published_at"] = datetime.utcnow()

    # Update category if provided
    if "category_id" in update_data:
        category = await db.categories.find_one({"_id": ObjectId(update_data["category_id"])})
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category not found"
            )

    # Update blog
    update_data["updated_at"] = datetime.utcnow()
    await db.blogs.update_one(
        {"_id": ObjectId(blog_id)},
        {"$set": update_data}
    )

    # Get updated blog
    updated_blog = await db.blogs.find_one({"_id": ObjectId(blog_id)})

    # Get author
    author = await db.users.find_one({"_id": ObjectId(updated_blog["author_id"])})

    # Get category
    category = await db.categories.find_one({"_id": ObjectId(updated_blog["category_id"])})

    return BlogResponse(
        id=str(updated_blog["_id"]),
        title=updated_blog["title"],
        slug=updated_blog["slug"],
        content=updated_blog["content"],
        excerpt=updated_blog["excerpt"],
        author=User(
            id=str(author["_id"]),
            name=author["name"],
            email=author["email"],
            bio=author.get("bio", ""),
            avatar=author.get("avatar", None)
        ),
        category_id=str(category["_id"]),
        category=Category(
            id=str(category["_id"]),
            name=category["name"],
            slug=category["slug"]
        ),
        tags=updated_blog.get("tags", []),
        cover_image=updated_blog.get("cover_image"),
        published=updated_blog.get("published", True),
        views_count=updated_blog.get("views_count", 0),
        likes_count=updated_blog.get("likes_count", 0),
        comments_count=updated_blog.get("comments_count", 0),
        published_at=updated_blog.get("published_at"),
        created_at=updated_blog.get("created_at"),
        updated_at=updated_blog.get("updated_at")
    )


async def delete_blog(blog_id: str, author_id: str) -> bool:
    from app.main import app
    db = app.mongodb

    # Check if blog exists and user is the author
    blog = await db.blogs.find_one({"_id": ObjectId(blog_id)})
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found"
        )

    if str(blog["author_id"]) != author_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this blog"
        )

    # Delete blog
    result = await db.blogs.delete_one({"_id": ObjectId(blog_id)})

    # Delete related comments and likes
    await db.comments.delete_many({"blog_id": ObjectId(blog_id)})
    await db.likes.delete_many({"blog_id": ObjectId(blog_id)})

    return result.deleted_count > 0


async def get_blog_by_slug(slug: str, user_id: Optional[str] = None) -> BlogResponse:
    from app.main import app
    db = app.mongodb

    # Get blog
    blog = await db.blogs.find_one({"slug": slug})
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found"
        )

    # Get author
    author = await db.users.find_one({"_id": ObjectId(blog["author_id"])})

    # Get category
    category = await db.categories.find_one({"_id": ObjectId(blog["category_id"])})

    # Check if user has liked the blog
    is_liked = False
    if user_id:
        like = await db.likes.find_one({
            "blog_id": blog["_id"],
            "user_id": ObjectId(user_id)
        })
        is_liked = like is not None

    return BlogResponse(
        id=str(blog["_id"]),
        title=blog["title"],
        slug=blog["slug"],
        content=blog["content"],
        excerpt=blog["excerpt"],
        author=User(
            id=str(author["_id"]),
            name=author["name"],
            email=author["email"],
            bio=author.get("bio", ""),
            avatar=author.get("avatar", None)
        ),
        category_id=str(category["_id"]),
        category=Category(
            id=str(category["_id"]),
            name=category["name"],
            slug=category["slug"]
        ),
        tags=blog.get("tags", []),
        cover_image=blog.get("cover_image"),
        published=blog.get("published", True),
        views_count=blog.get("views_count", 0),
        likes_count=blog.get("likes_count", 0),
        comments_count=blog.get("comments_count", 0),
        is_liked=is_liked,
        published_at=blog.get("published_at"),
        created_at=blog.get("created_at"),
        updated_at=blog.get("updated_at")
    )

async def get_blogs(
        search: Optional[str] = None,
        category: Optional[str] = None,
        tag: Optional[str] = None,
        sort: Optional[str] = "desc",
        skip: int = 0,
        limit: int = 10,
        user_id: Optional[str] = None
) -> List[BlogResponse]:
    from app.main import app
    db = app.mongodb

    # Build query
    query = {"published": True}

    if search:
        # Use text search if search parameter is provided
        query["$text"] = {"$search": search}

    if category:
        category_obj = await db.categories.find_one({"slug": category})
        if category_obj:
            query["category_id"] = str(category_obj["_id"])

    if tag:
        query["tags"] = {"$in": [tag]}

    # Sort by published_at or relevance score if searching
    sort_options = {}
    if search:
        sort_options["score"] = {"$meta": "textScore"}
        blogs_cursor = db.blogs.find(query, {"score": {"$meta": "textScore"}}).sort([
            ("score", {"$meta": "textScore"}),
            ("published_at", -1 if sort == "desc" else 1)
        ]).skip(skip).limit(limit)
    else:
        sort_direction = -1 if sort == "desc" else 1
        blogs_cursor = db.blogs.find(query).sort("published_at", sort_direction).skip(skip).limit(limit)

    blogs = await blogs_cursor.to_list(length=limit)

    # Get authors and categories
    blog_responses = []
    for blog in blogs:
        author = await db.users.find_one({"_id": ObjectId(blog["author_id"])})
        category = await db.categories.find_one({"_id": ObjectId(blog["category_id"])})

        # Check if user has liked the blog
        is_liked = False
        if user_id:
            like = await db.likes.find_one({
                "blog_id": blog["_id"],
                "user_id": ObjectId(user_id)
            })
            is_liked = like is not None

        blog_responses.append(BlogResponse(
            id=str(blog["_id"]),
            title=blog["title"],
            slug=blog["slug"],
            content=blog["content"],
            excerpt=blog["excerpt"],
            author=User(
                id=str(author["_id"]),
                name=author["name"],
                email=author["email"],
                bio=author.get("bio", ""),
                avatar=author.get("avatar", None)
            ),
            category_id=str(category["_id"]),
            category=Category(
                id=str(category["_id"]),
                name=category["name"],
                slug=category["slug"]
            ),
            tags=blog.get("tags", []),
            cover_image=blog.get("cover_image"),
            published=blog.get("published", True),
            views_count=blog.get("views_count", 0),
            likes_count=blog.get("likes_count", 0),
            comments_count=blog.get("comments_count", 0),
            is_liked=is_liked,
            published_at=blog.get("published_at"),
            created_at=blog.get("created_at"),
            updated_at=blog.get("updated_at")
        ))

    return blog_responses


async def get_user_blogs(user_id: str) -> List[BlogResponse]:
    from app.main import app
    db = app.mongodb

    # Get blogs by user
    blogs_cursor = db.blogs.find({"author_id": ObjectId(user_id)}).sort("created_at", -1)
    blogs = await blogs_cursor.to_list(length=None)

    # Get categories
    blog_responses = []
    for blog in blogs:
        category = await db.categories.find_one({"_id": blog["category_id"]})

        # Get author
        author = await db.users.find_one({"_id": blog["author_id"]})

        blog_responses.append(BlogResponse(
            id=str(blog["_id"]),
            title=blog["title"],
            slug=blog["slug"],
            content=blog["content"],
            excerpt=blog["excerpt"],
            author=User(
                id=str(author["_id"]),
                name=author["name"],
                email=author["email"],
                bio=author.get("bio", ""),
                avatar=author.get("avatar", None)
            ),
            category=Category(
                id=str(category["_id"]),
                name=category["name"],
                slug=category["slug"]
            ),
            tags=blog.get("tags", []),
            cover_image=blog.get("cover_image"),
            published=blog.get("published", True),
            views_count=blog.get("views_count", 0),
            likes_count=blog.get("likes_count", 0),
            comments_count=blog.get("comments_count", 0),
            published_at=blog.get("published_at"),
            created_at=blog.get("created_at"),
            updated_at=blog.get("updated_at")
        ))

    return blog_responses


async def like_blog(slug: str, user_id: str) -> bool:
    from app.main import app
    db = app.mongodb

    # Get blog
    blog = await db.blogs.find_one({"slug": slug})
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found"
        )

    # Check if user has already liked the blog
    like = await db.likes.find_one({
        "blog_id": blog["_id"],
        "user_id": ObjectId(user_id)
    })

    if like:
        # Unlike the blog
        await db.likes.delete_one({"_id": like["_id"]})
        await db.blogs.update_one(
            {"_id": blog["_id"]},
            {"$inc": {"likes_count": -1}}
        )
    else:
        # Like the blog
        await db.likes.insert_one({
            "blog_id": blog["_id"],
            "user_id": ObjectId(user_id),
            "created_at": datetime.utcnow()
        })
        await db.blogs.update_one(
            {"_id": blog["_id"]},
            {"$inc": {"likes_count": 1}}
        )

        # Send notification if liking (not unliking)
        try:
            # Get blog author and user info
            blog_author = await db.users.find_one({"_id": blog["author_id"]})
            user = await db.users.find_one({"_id": ObjectId(user_id)})

            # Don't notify if liking own post
            if str(blog["author_id"]) != user_id:
                from app.services.email import send_like_notification
                await send_like_notification(
                    blog_author_email=blog_author["email"],
                    blog_title=blog["title"],
                    liker_name=user["name"],
                    blog_url=f"{settings.FRONTEND_URL}/blog/{slug}"
                )
        except Exception as e:
            print(f"Failed to send like notification: {e}")

    return True


async def get_liked_blogs(user_id: str) -> List[BlogResponse]:
    from app.main import app
    db = app.mongodb

    # Get likes by user
    likes_cursor = db.likes.find({"user_id": ObjectId(user_id)}).sort("created_at", -1)
    likes = await likes_cursor.to_list(length=None)

    # Get blogs
    blog_responses = []
    for like in likes:
        blog = await db.blogs.find_one({"_id": like["blog_id"]})
        if blog:
            author = await db.users.find_one({"_id": blog["author_id"]})
            category = await db.categories.find_one({"_id": blog["category_id"]})

            blog_responses.append(BlogResponse(
                id=str(blog["_id"]),
                title=blog["title"],
                slug=blog["slug"],
                content=blog["content"],
                excerpt=blog["excerpt"],
                author=User(
                    id=str(author["_id"]),
                    name=author["name"],
                    email=author["email"],
                    bio=author.get("bio", ""),
                    avatar=author.get("avatar", None)
                ),
                category=Category(
                    id=str(category["_id"]),
                    name=category["name"],
                    slug=category["slug"]
                ),
                tags=blog.get("tags", []),
                cover_image=blog.get("cover_image"),
                published=blog.get("published", True),
                views_count=blog.get("views_count", 0),
                likes_count=blog.get("likes_count", 0),
                comments_count=blog.get("comments_count", 0),
                is_liked=True,
                published_at=blog.get("published_at"),
                created_at=blog.get("created_at"),
                updated_at=blog.get("updated_at")
            ))

    return blog_responses


async def get_categories():
    from app.main import app
    db = app.mongodb

    categories_cursor = db.categories.find().sort("name", 1)
    categories = await categories_cursor.to_list(length=None)

    return [Category(
        id=str(category["_id"]),
        name=category["name"],
        slug=category["slug"]
    ) for category in categories]