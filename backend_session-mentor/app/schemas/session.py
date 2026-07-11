from pydantic import BaseModel, Field
from typing import Literal
import datetime


class SessionCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    date: datetime.date
    time: str
    mentor: str


class SessionUpdate(BaseModel):
    title: str | None = None
    date: datetime.date | None = None
    time: str | None = None
    mentor: str | None = None
    status: Literal["scheduled", "completed", "cancelled"] | None = None


class SessionResponse(BaseModel):
    id: int
    title: str
    date: datetime.date
    time: str
    mentor: str
    status: str