from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
import logging
import os
from app.config import settings
from app.routes import auth, users, blogs, comments, uploads, analytics

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("app.log")
    ]
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="BlogMind API",
    description="API for BlogMind blog platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Mount static files
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


# Add routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(blogs.router, prefix="/api/blogs", tags=["Blogs"])
app.include_router(comments.router, prefix="/api/comments", tags=["Comments"])
app.include_router(uploads.router, prefix="/api/uploads", tags=["Uploads"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])


# Startup event
@app.on_event("startup")
async def startup_db_client():
    app.mongodb_client = AsyncIOMotorClient(settings.MONGODB_URL)
    app.mongodb = app.mongodb_client[settings.MONGODB_DB_NAME]

    # Create indexes
    await app.mongodb.users.create_index("email", unique=True)
    await app.mongodb.blogs.create_index("slug", unique=True)
    await app.mongodb.blogs.create_index("author_id")
    await app.mongodb.blogs.create_index("category_id")
    await app.mongodb.blogs.create_index("published_at")
    await app.mongodb.blogs.create_index([
        ("title", "text"),
        ("content", "text"),
        ("excerpt", "text")
    ])
    await app.mongodb.comments.create_index("blog_id")
    await app.mongodb.comments.create_index("user_id")
    await app.mongodb.likes.create_index([("blog_id", 1), ("user_id", 1)], unique=True)
    await app.mongodb.view_events.create_index("blog_id")
    await app.mongodb.view_events.create_index("created_at")

    logger.info("Database connection established and indexes created")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()
    logger.info("Database connection closed")


# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to BlogMind API"}