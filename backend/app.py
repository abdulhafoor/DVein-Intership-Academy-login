from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from database.db import db
from routes import register_routes


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt = JWTManager()
    jwt.init_app(app)
    CORS(app, origins=app.config['CORS_ORIGINS'].split(','), supports_credentials=True)

    register_routes(app)

    @jwt.unauthorized_loader
    def unauthorized_response(message):
        return jsonify({'message': message}), 401

    @jwt.invalid_token_loader
    def invalid_token_response(message):
        return jsonify({'message': message}), 422

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'message': 'Resource not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'message': 'Internal server error'}), 500

    @app.route('/api/health')
    def health():
        return jsonify({'status': 'ok'})

    return app


app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)
