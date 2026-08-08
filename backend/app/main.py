from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.database import db

app = FastAPI(title="Research Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routes.users import router as users_router
from app.routes.roles import router as role_router
from app.routes.auth import router as auth_router
from app.routes.permission import router as permission_router

app.include_router(permission_router)
app.include_router(role_router)
app.include_router(users_router)
app.include_router(auth_router)





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