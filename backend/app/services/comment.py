from fastapi import HTTPException, status
from typing import List
from app.schemas.comment import CommentCreate, CommentUpdate, CommentResponse
from app.schemas.user import User
from app.models.comment import CommentModel
from bson import ObjectId
from datetime import datetime


async def create_comment(comment_in: CommentCreate, user_id: str) -> CommentResponse:
    from app.main import app
    db = app.mongodb

    # Check if blog exists
    blog = await db.blogs.find_one({"_id": ObjectId(comment_in.blog_id)})
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found"
        )

    # Create comment
    comment_model = CommentModel(
        blog_id=str(comment_in.blog_id),
        user_id=str(user_id),
        content=comment_in.content
    )

    result = await db.comments.insert_one(comment_model.dict(by_alias=True))


    # Update blog comments count
    await db.blogs.update_one(
        {"_id": ObjectId(comment_in.blog_id)},
        {"$inc": {"comments_count": 1}}
    )

    # Get user
    user = await db.users.find_one({"_id": ObjectId(user_id)})

    # Send notification to blog author
    try:
        # Get blog author and user info
        blog_author = await db.users.find_one({"_id": ObjectId(blog["author_id"])})

        # Don't notify if commenting on own post
        if str(blog["author_id"]) != user_id:
            from app.services.email import send_comment_notification
            await send_comment_notification(
                blog_author_email=blog_author["email"],
                blog_title=blog["title"],
                comment_author_name=user["name"],
                comment_content=comment_in.content,
                blog_url=f"{settings.FRONTEND_URL}/blog/{blog['slug']}"
            )
    except Exception as e:
        print(f"Failed to send comment notification: {e}")

    return CommentResponse(
        id=str(result.inserted_id),
        blog_id=comment_in.blog_id,
        content=comment_in.content,
        user=User(
            id=str(user["_id"]),
            name=user["name"],
            email=user["email"],
            bio=user.get("bio", ""),
            avatar=user.get("avatar", None)
        ),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )


async def update_comment(comment_id: str, comment_update: CommentUpdate, user_id: str) -> CommentResponse:
    from app.main import app
    db = app.mongodb

    # Check if comment exists and user is the author
    comment = await db.comments.find_one({"_id": ObjectId(comment_id)})
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    if str(comment["user_id"]) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this comment"
        )

    # Update comment
    update_data = {
        "content": comment_update.content,
        "updated_at": datetime.utcnow()
    }

    await db.comments.update_one(
        {"_id": ObjectId(comment_id)},
        {"$set": update_data}
    )

    # Get updated comment
    updated_comment = await db.comments.find_one({"_id": ObjectId(comment_id)})

    # Get user
    user = await db.users.find_one({"_id": ObjectId(updated_comment["user_id"])})

    return CommentResponse(
        id=str(updated_comment["_id"]),
        blog_id=str(updated_comment["blog_id"]),
        content=updated_comment["content"],
        user=User(
            id=str(user["_id"]),
            name=user["name"],
            email=user["email"],
            bio=user.get("bio", ""),
            avatar=user.get("avatar", None)
        ),
        created_at=updated_comment.get("created_at"),
        updated_at=updated_comment.get("updated_at")
    )


async def delete_comment(comment_id: str, user_id: str) -> bool:
    from app.main import app
    db = app.mongodb

    # Check if comment exists and user is the author
    comment = await db.comments.find_one({"_id": ObjectId(comment_id)})
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    if str(comment["user_id"]) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this comment"
        )

    # Delete comment
    result = await db.comments.delete_one({"_id": ObjectId(comment_id)})

    # Update blog comments count
    await db.blogs.update_one(
        {"_id": comment["blog_id"]},
        {"$inc": {"comments_count": -1}}
    )

    return result.deleted_count > 0


async def get_blog_comments(blog_id: str) -> List[CommentResponse]:
    from app.main import app
    db = app.mongodb

    # Check if blog exists
    blog = await db.blogs.find_one({"_id": ObjectId(blog_id)})
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found"
        )

    # Get comments
    comments_cursor = db.comments.find({"blog_id": str(blog_id)}).sort("created_at", -1)
    comments = await comments_cursor.to_list(length=None)

    # Get users
    comment_responses = []
    for comment in comments:
        user = await db.users.find_one({"_id": ObjectId(comment["user_id"])})

        comment_responses.append(CommentResponse(
            id=str(comment["_id"]),
            blog_id=str(comment["blog_id"]),
            content=comment["content"],
            user=User(
                id=str(user["_id"]),
                name=user["name"],
                email=user["email"],
                bio=user.get("bio", ""),
                avatar=user.get("avatar", None)
            ),
            created_at=comment.get("created_at"),
            updated_at=comment.get("updated_at")
        ))

    return comment_responses


async def get_user_comments(user_id: str) -> List[CommentResponse]:
    from app.main import app
    db = app.mongodb

    # Get comments by user
    comments_cursor = db.comments.find({"user_id": (user_id)}).sort("created_at", -1)
    comments = await comments_cursor.to_list(length=None)

    # Get blogs
    comment_responses = []
    for comment in comments:
        blog = await db.blogs.find_one({"_id": ObjectId(comment["blog_id"])})
        if blog:
            user = await db.users.find_one({"_id": ObjectId(comment["user_id"])})

            comment_responses.append(CommentResponse(
                id=str(comment["_id"]),
                blog_id=str(comment["blog_id"]),
                content=comment["content"],
                user=User(
                    id=str(user["_id"]),
                    name=user["name"],
                    email=user["email"],
                    bio=user.get("bio", ""),
                    avatar=user.get("avatar", None)
                ),
                created_at=comment.get("created_at"),
                updated_at=comment.get("updated_at")
            ))

    return comment_responses