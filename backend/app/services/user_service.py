from app.config.database import db

from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime
import bcrypt

users_collection = db["users"]


# Generate USER001, USER002...
def generate_user_id():

    last_user = users_collection.find_one(
        sort=[("user_id", -1)]
    )

    if last_user and last_user.get("user_id"):

        number = int(last_user["user_id"].replace("USER", "")) + 1

    else:

        number = 1

    return f"USER{number:03d}"


# Serialize user
def serialize_user(user):

    return {
        "_id": str(user["_id"]),
        "user_id": user.get("user_id"),
        "name": user.get("name"),
        "email": user.get("email"),
        "role_id": str(user["role_id"]) if user.get("role_id") else None,
        "is_active": user.get("is_active"),
        "last_active": user.get("last_active"),
        "created_at": user.get("created_at"),
        "updated_at": user.get("updated_at")
    }


# Get all users
def get_users():

    result = []

    for user in users_collection.find():
        result.append(serialize_user(user))

    return result


# Get single user
def get_user(id):

    try:

        user = users_collection.find_one(
            {
                "_id": ObjectId(id)
            }
        )

    except InvalidId:
        raise InvalidId

    if user:
        return serialize_user(user)

    return None


# Update user
def update_user(id, data):

    try:
        user_id = ObjectId(id)

    except InvalidId:
        raise InvalidId

    update_data = {}

    if "name" in data:
        update_data["name"] = data["name"]

    if "email" in data:
        update_data["email"] = data["email"]

    if "password" in data:

        hashed_password = bcrypt.hashpw(
            data["password"].encode("utf-8"),
            bcrypt.gensalt()
        )

        update_data["password"] = hashed_password.decode("utf-8")

    if "role_id" in data:
        update_data["role_id"] = ObjectId(data["role_id"])

    if "is_active" in data:
        update_data["is_active"] = data["is_active"]

    if "last_active" in data:
        update_data["last_active"] = data["last_active"]

    update_data["updated_at"] = datetime.utcnow()

    result = users_collection.update_one(
        {
            "_id": user_id
        },
        {
            "$set": update_data
        }
    )
    

    return result.modified_count


def create_user(data):

    # Check if email already exists
    existing_user = users_collection.find_one(
        {
            "email": data["email"]
        }
    )

    if existing_user:
        return None


    # Hash password
    hashed_password = bcrypt.hashpw(
        data["password"].encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


    user = {

        "user_id": generate_user_id(),

        "name": data["name"],

        "email": data["email"],

        "password": hashed_password,

        "role_id": ObjectId(data["role_id"]),

        "is_active": data.get("is_active", True),

        "last_active": None,

        "created_at": datetime.utcnow(),

        "updated_at": datetime.utcnow()

    }


    result = users_collection.insert_one(user)

    return str(result.inserted_id)