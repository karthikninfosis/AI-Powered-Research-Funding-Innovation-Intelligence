from dotenv import load_dotenv
import os

load_dotenv()


# =========================================================
# MongoDB
# =========================================================

MONGO_URI = os.getenv("MONGO_URI")

DATABASE_NAME = os.getenv("DATABASE_NAME")


# =========================================================
# JWT
# =========================================================

JWT_SECRET = os.getenv("JWT_SECRET")

JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")

JWT_EXPIRE_MINUTES = int(
    os.getenv("JWT_EXPIRE_MINUTES")
)


# =========================================================
# User Service
# =========================================================

USER_SERVICE_URL = os.getenv("USER_SERVICE_URL")


# =========================================================
# Supabase
# =========================================================

SUPABASE_URL = os.getenv("SUPABASE_URL")

SUPABASE_SECRET_KEY = os.getenv(
    "SUPABASE_SECRET_KEY"
)