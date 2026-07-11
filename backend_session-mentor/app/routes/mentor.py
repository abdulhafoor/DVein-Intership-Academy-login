from fastapi import APIRouter
from app.schemas.mentor import ChatRequest
from app.services.mentor_service import MentorService

router = APIRouter(
    prefix="/api/mentor",
    tags=["AI Mentor"]
)


@router.post("/chat")
def chat(data: ChatRequest):
    return MentorService.chat(data)


@router.get("/progress")
def progress():
    return MentorService.progress()


@router.get("/assessments")
def assessments():
    return MentorService.assessments()


@router.get("/recommendations")
def recommendations():
    return MentorService.recommendations()


@router.post("/assessment/{assessment_id}")
def submit_assessment(assessment_id: int):
    return MentorService.submit_assessment(assessment_id)