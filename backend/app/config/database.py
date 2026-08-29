from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from app.config.settings import MONGO_URI, DATABASE_NAME

if not MONGO_URI:
    raise ValueError("MONGO_URI not found in .env file")

try:
    client = MongoClient(MONGO_URI)

    # Test connection
    client.admin.command("ping")
    print("[DB] Connected to MongoDB")

    # Select database
    db = client[DATABASE_NAME]

except ConnectionFailure as e:
    print("[DB] Failed to connect to MongoDB")
    raise e

except Exception as e:
    print("[DB] Error:", e)
    raise e

