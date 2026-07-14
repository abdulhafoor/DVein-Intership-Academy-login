import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv(
        'SECRET_KEY',
        os.getenv('JWT_SECRET_KEY', 'change-this-development-secret-key'),
    )
    SQLALCHEMY_DATABASE_URI = os.getenv(
    'DATABASE_URI',
    'mysql+pymysql://root@localhost/attendance_db',
)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'change-this-development-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES_DAYS', '7')))
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhopython pst:5173')
    COMPANY_NAME = os.getenv('COMPANY_NAME', 'Internship Academy')
