from .auth import auth_bp
from .attendance import attendance_bp
from .report import report_bp


def register_routes(app):
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(attendance_bp, url_prefix='/api/attendance')
    app.register_blueprint(report_bp, url_prefix='/api/report')
