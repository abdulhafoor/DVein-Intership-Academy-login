from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str


class ProgressResponse(BaseModel):
    currentTopic: str
    progressPercentage: int
    completedTopics: list[str]
    topics: list[str]


class AssessmentResponse(BaseModel):
    id: int
    title: str
    score: int
    totalScore: int
    date: str
    status: str


class RecommendationResponse(BaseModel):
    id: int
    type: str
    title: str
    description: str
    level: str
    duration: str