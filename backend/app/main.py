from fastapi import FastAPI

from app.config.database import db
from app.routes.auth import router as auth_router
from app.routes.permission import router as permission_router
from app.routes.roles import router as role_router
from app.routes.users import router as users_router

app = FastAPI(title="Research Platform API")

app.include_router(auth_router)
app.include_router(permission_router)
app.include_router(role_router)
app.include_router(users_router)


@app.get("/")
def root():
    return {"message": "API Running"}


@app.post("/test")
async def test_db():
    data = {
        "name": "testing",
        "email": "testing@example.com",
        "role": "user"
    }

    result = db.testing_collection.insert_one(data)

    return {
        "message": "Inserted Successfully",
    }
