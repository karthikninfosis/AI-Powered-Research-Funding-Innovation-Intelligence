from fastapi import FastAPI
from app.config.database import db
from app.routes.publications import router as publications_router

app = FastAPI(title="Research Platform API")
from app.routes.users import router as users_router

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


# Publications APIs
app.include_router(publications_router)