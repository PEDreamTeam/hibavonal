from flask import Flask, jsonify, request
from flasgger import Swagger
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
import os

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL",
    "sqlite:///hibavonal.db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")

db = SQLAlchemy(app)
migrate = Migrate(app, db)

CORS(app, origins=["http://localhost:5173"])

import models

swagger = Swagger(app)

from routes.auth import auth_bp
app.register_blueprint(auth_bp, url_prefix="/api/auth")

from routes.rooms import rooms_bp
app.register_blueprint(rooms_bp, url_prefix="/api/rooms")

@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "Hello from Flask backend!"})

@app.route('/tickets/create', methods=['POST'])
def create_ticket():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"message": "Invalid JSON payload"}), 400

    room = data.get('room')
    description = data.get('description')
    student_id = data.get('studentId')

    if not room or not description or not student_id:
        return jsonify({"message": "room, description and studentId are required"}), 400

    return jsonify({
        'message': 'Ticket created',
        'ticket': {
            'room': room,
            'description': description,
            'studentId': student_id,
        },
    }), 201

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
