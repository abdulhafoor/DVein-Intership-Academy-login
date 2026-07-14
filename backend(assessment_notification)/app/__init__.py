import os
from flask import Flask, jsonify
from flask_cors import CORS

from app.extensions import db
from app.config import Config


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    os.makedirs(os.path.dirname(app.config["SQLALCHEMY_DATABASE_URI"].replace("sqlite:///", "")) or ".", exist_ok=True)

    db.init_app(app)
    CORS(app)  # allow the React frontend (any origin) to call this API

    from app.routes.assessment_routes import assessment_bp
    from app.routes.notification_routes import notification_bp

    app.register_blueprint(assessment_bp, url_prefix="/api/assessment-records")
    app.register_blueprint(notification_bp, url_prefix="/api/notifications")

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({"status": "ok", "message": "Backend is running"}), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(413)
    def too_large(e):
        return jsonify({"error": "File too large"}), 413

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    with app.app_context():
        db.create_all()

    return app
