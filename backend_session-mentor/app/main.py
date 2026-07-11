from fastapi import FastAPI
from app.routes.session import router as session_router
from app.routes.mentor import router as mentor_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Internship Academy API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:4176",
        "http://127.0.0.1:4176",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(session_router)
app.include_router(mentor_router)


@app.get("/")
def root():
    return {
        "message": "Internship Academy Backend Running"
    }