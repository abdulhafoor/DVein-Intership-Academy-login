from datetime import datetime, date

from app.extensions import db


class AssessmentRecord(db.Model):
    __tablename__ = "assessment_records"

    id = db.Column(db.Integer, primary_key=True)

    student_name = db.Column(db.String(150), nullable=False)
    assessment_name = db.Column(db.String(200), nullable=False)
    marks = db.Column(db.Float, nullable=False, default=0)
    submitted_date = db.Column(db.Date, nullable=False, default=date.today)

    # Name of the source Excel file this record came from (audit trail)
    source_file = db.Column(db.String(255), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        """
        Shape matches the frontend's `normalizeRow` output exactly, so
        records returned by the API can be dropped straight into React
        state without remapping keys.
        """
        return {
            "id": self.id,
            "studentName": self.student_name,
            "assessmentName": self.assessment_name,
            "marks": self.marks,
            "submittedDate": self.submitted_date.isoformat() if self.submitted_date else None,
            "sourceFile": self.source_file,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
