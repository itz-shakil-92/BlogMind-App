from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import asyncio
from app.utils.slugify import slugify
import os

async def init_db():
    # Connect to MongoDB

    client = AsyncIOMotorClient(os.getenv("MONGODB_URL", "mongodb://localhost:27017"))
    db = client["blogmind"]

    # Create categories collection if it doesn't exist
    count = await db.categories.count_documents({})
    if count == 0:
        # Create default categories
        categories = [
            "Technology",
            "Lifestyle",
            "Health",
            "Business",
            "Travel",
            "Food",
            "Science"
        ]

        for category in categories:
            await db.categories.insert_one({
                "name": category,
                "slug": slugify(category),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })

        print("Default categories created.")
    else:
        print("Categories already exist.")

    print("Database initialized successfully.")


if __name__ == "__main__":
    asyncio.run(init_db())