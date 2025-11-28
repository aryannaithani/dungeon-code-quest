from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    # fallback for local testing
    MONGO_URI = "mongodb://localhost:27017"

client = AsyncIOMotorClient(MONGO_URI)
db = client[os.getenv("MONGODB_DB")]

users_col = db["users"]
questions_col = db["questions"]
submissions_col = db["submissions"]
