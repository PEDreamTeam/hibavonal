from flasgger import Swagger, swag_from
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
from routes.tools import tools_bp

app.register_blueprint(tool_orders_bp)
app.register_blueprint(ticket_types_bp)
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(rooms_bp, url_prefix="/api/rooms")
app.register_blueprint(student_feedback_bp)
app.register_blueprint(tickets_bp)
app.register_blueprint(tools_bp)

swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "Hibavonal API",
        "description": "Maintenance ticketing system API",
        "version": "1.0.0",
    },
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "JWT token. Format: Bearer <token>",
        }
    },
    "definitions": {
        "Error": {
            "type": "object",
            "properties": {
                "error": {"type": "string"},
            },
        },
        "User": {
            "type": "object",
            "properties": {
                "user_id": {"type": "integer"},
                "username": {"type": "string"},
                "email": {"type": "string"},
                "role": {"type": "string"},
                "room_id": {"type": "integer", "x-nullable": True},
            },
        },
        "Room": {
            "type": "object",
            "properties": {
                "room_id": {"type": "integer"},
                "name": {"type": "string"},
                "notes": {"type": "string", "x-nullable": True},
            },
        },
        "Ticket": {
            "type": "object",
            "properties": {
                "ticket_id": {"type": "integer"},
                "room_id": {"type": "integer"},
                "room_name": {"type": "string"},
                "student_id": {"type": "integer"},
                "student_username": {"type": "string"},
                "maintainer_id": {"type": "integer", "x-nullable": True},
                "maintainer_username": {"type": "string", "x-nullable": True},
                "ticket_type_id": {"type": "integer", "x-nullable": True},
                "ticket_type_name": {"type": "string", "x-nullable": True},
                "details": {"type": "string"},
                "status": {
                    "type": "string",
                    "enum": ["created", "in_progress", "ready_to_done", "done"],
                },
                "priority": {"type": "integer"},
                "is_deleted": {"type": "boolean"},
                "feedback": {"type": "object", "x-nullable": True},
            },
        },
        "TicketWithTools": {
            "allOf": [
                {"$ref": "#/definitions/Ticket"},
                {
                    "type": "object",
                    "properties": {
                        "tools": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "tool_id": {"type": "integer"},
                                    "name": {"type": "string"},
                                },
                            },
                        }
                    },
                },
            ]
        },
        "ToolOrder": {
            "type": "object",
            "properties": {
                "tool_order_id": {"type": "integer"},
                "tool_id": {"type": "integer"},
                "tool_name": {"type": "string", "x-nullable": True},
                "name": {"type": "string"},
                "details": {"type": "string", "x-nullable": True},
                "status": {"type": "string", "enum": ["ordered", "ready"]},
                "created_by": {"type": "string"},
                "created_at": {"type": "string", "format": "date-time"},
            },
        },
    },
}

swagger = Swagger(app, template=swagger_template)

from utils.docs import doc_path

@app.route("/", methods=["GET"])
@swag_from(doc_path("health", "index.yml"))
def index():
    return jsonify({"message": "Hello from Flask backend!"})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
