from database.db import db


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='intern')
    department = db.Column(db.String(100), nullable=True)
    batch = db.Column(db.String(100), nullable=True)

    attendances = db.relationship(
        'Attendance',
        back_populates='user',
        cascade='all, delete-orphan',
        lazy=True,
    )

    @property
    def password_hash(self):
        return self.password

    @password_hash.setter
    def password_hash(self, value):
        self.password = value

    @property
    def domain(self):
        return self.department

    @domain.setter
    def domain(self, value):
        self.department = value

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'department': self.department,
            'domain': self.department,
            'batch': self.batch,
        }
