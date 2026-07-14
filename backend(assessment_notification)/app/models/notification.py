from datetime import datetime

from app.extensions import db


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)

    message = db.Column(db.Text, nullable=False)
    # "All Interns" | "Batch A" | "Batch B" | "Batch C"
    recipient = db.Column(db.String(50), nullable=False)
    # "unread" | "read"
    status = db.Column(db.String(10), nullable=False, default="unread")

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    read_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        """Shape matches the frontend's local notification objects exactly."""
        return {
            "id": self.id,
            "message": self.message,
            "recipient": self.recipient,
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "readAt": self.read_at.isoformat() if self.read_at else None,
        }
