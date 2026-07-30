from app.config.database import db

users_collection = db["users"]

def get_users():
    return list(users_collection.find())