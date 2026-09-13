from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.database import db
from app.routes.document import router as document_router
from app.routes.innovation_scores import router as innovation_scores_router

app = FastAPI(title="Research Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000","http://127.0.0.1:5500","http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=False,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

from app.routes.users import router as users_router
from app.routes.roles import router as role_router
from app.routes.auth import router as auth_router
from app.routes.permission import router as permission_router
from app.routes.research_profiles import router as research_profiles_router
from app.routes.research_domains import router as research_domains_router
from app.routes.funding import router as funding_router
from app.routes.document import router as document_router
from app.routes.publications import router as publications_router
from app.routes.technologies import router as technology_router
from app.routes.patents import router as patents_router
from app.routes.patent_analysis import router as patent_analysis_router
from app.services.patent_service import ensure_patent_indexes
from app.routes.commercialization import router as commercialization_router

app = FastAPI(title="Research Platform API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5500",
        "http://192.168.1.9:8000/",
        "http://192.168.1.10:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(permission_router)
app.include_router(role_router)
app.include_router(users_router)
app.include_router(research_domains_router)
app.include_router(auth_router)
app.include_router(research_profiles_router)
app.include_router(funding_router)
app.include_router(document_router)
app.include_router(publications_router)
app.include_router(technology_router)
app.include_router(patents_router)
app.include_router(patent_analysis_router)
app.include_router(innovation_scores_router)
app.include_router(commercialization_router)


@app.on_event("startup")
def create_patent_indexes():
    ensure_patent_indexes()


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
