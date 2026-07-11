from app.schemas.session import SessionCreate, SessionUpdate

sessions = []


class SessionService:

    @staticmethod
    def get_all():
        return sessions

    @staticmethod
    def create(session: SessionCreate):
        new_session = {
            "id": len(sessions) + 1,
            "title": session.title,
            "date": session.date,
            "time": session.time,
            "mentor": session.mentor,
            "status": "scheduled"
        }

        sessions.append(new_session)

        return new_session

    @staticmethod
    def get_by_id(session_id: int):
        for session in sessions:
            if session["id"] == session_id:
                return session

        return None

    @staticmethod
    def update(session_id: int, data: SessionUpdate):

        session = SessionService.get_by_id(session_id)

        if not session:
            return None

        update_data = data.model_dump(exclude_unset=True)

        session.update(update_data)

        return session

    @staticmethod
    def delete(session_id: int):

        session = SessionService.get_by_id(session_id)

        if not session:
            return False

        sessions.remove(session)

        return True

    @staticmethod
    def complete(session_id: int):

        session = SessionService.get_by_id(session_id)

        if not session:
            return None

        session["status"] = "completed"

        return session