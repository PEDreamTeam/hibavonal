from flask import Flask, jsonify
from flasgger import Swagger
from flask_cors import CORS
import os
from pathlib import Path

from extensions import db, migrate

app = Flask(__name__)

BASE_DIR = Path(__file__).resolve().parent
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{(BASE_DIR / 'instance' / 'hibavonal.db').as_posix()}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")

db.init_app(app)
migrate.init_app(app, db)

CORS(app, origins=["http://localhost:5173"])

import models

from routes.tool_orders import tool_orders_bp
from routes.ticket_types import ticket_types_bp
from routes.auth import auth_bp
from routes.rooms import rooms_bp
from routes.student_feedback import student_feedback_bp
from routes.tickets import tickets_bp

app.register_blueprint(tool_orders_bp)
app.register_blueprint(ticket_types_bp)
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(rooms_bp, url_prefix="/api/rooms")
app.register_blueprint(student_feedback_bp)
app.register_blueprint(tickets_bp)

swagger = Swagger(app)

from routes.auth import auth_bp
app.register_blueprint(auth_bp, url_prefix="/api/auth")

from routes.rooms import rooms_bp
app.register_blueprint(rooms_bp, url_prefix="/api/rooms")

from routes.tickets import tickets_bp
app.register_blueprint(tickets_bp, url_prefix="/api/tickets")

@app.route("/", methods=["GET"])
def index():
    """
    Get API status
    ---
    tags:
      - Health
    responses:
      200:
        description: API is running successfully
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Hello from Flask backend!"
    """
    return jsonify({"message": "Hello from Flask backend!"})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
