import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("MONGO_URI not found in .env file")

try:
    client = MongoClient(MONGO_URI)
    client.admin.command("ping")  
    print(" Connected to MongoDB")

except ConnectionFailure as e:
    print("Failed to connect to MongoDB")
    print(e)

except Exception as e:
    print("Error:", e)