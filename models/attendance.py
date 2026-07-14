from database.db import db


class Attendance(db.Model):
    __tablename__ = 'attendance'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    check_in = db.Column(db.Time, nullable=True)
    check_out = db.Column(db.Time, nullable=True)
    status = db.Column(db.String(20), nullable=False, default='absent')

    user = db.relationship('User', back_populates='attendances')

    __table_args__ = (
        db.UniqueConstraint('user_id', 'date', name='uniq_attendance_user_date'),
    )

    @property
    def intern_id(self):
        return self.user_id

    @intern_id.setter
    def intern_id(self, value):
        self.user_id = value

    def to_dict(self):
        user = self.user
        return {
            'id': self.id,
            'user_id': self.user_id,
            'intern_id': self.user_id,
            'intern_name': user.name if user else None,
            'intern_id_display': str(user.id) if user else str(self.user_id),
            'department': user.department if user else None,
            'domain': user.department if user else None,
            'batch': user.batch if user else None,
            'date': self.date.isoformat(),
            'check_in': self.check_in.isoformat(timespec='minutes') if self.check_in else None,
            'check_out': self.check_out.isoformat(timespec='minutes') if self.check_out else None,
            'status': self.status,
        }
