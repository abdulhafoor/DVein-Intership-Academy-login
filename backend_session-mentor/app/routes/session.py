from fastapi import APIRouter, HTTPException
from app.schemas.session import SessionCreate, SessionUpdate
from app.services.session_service import SessionService

router = APIRouter(
    prefix="/api/sessions",
    tags=["Session Scheduler"]
)


@router.post("/")
def create_session(session: SessionCreate):
    return SessionService.create(session)


@router.get("/")
def get_sessions():
    return SessionService.get_all()


@router.get("/{session_id}")
def get_session(session_id: int):

    session = SessionService.get_by_id(session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return session


@router.put("/{session_id}")
def update_session(session_id: int, data: SessionUpdate):

    session = SessionService.update(session_id, data)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return session


@router.delete("/{session_id}")
def delete_session(session_id: int):

    deleted = SessionService.delete(session_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "message": "Session deleted successfully"
    }


@router.patch("/{session_id}/complete")
def complete_session(session_id: int):

    session = SessionService.complete(session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return session