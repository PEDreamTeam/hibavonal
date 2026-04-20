from datetime import datetime, timedelta, timezone

import jwt
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash

from app import db
from models import User, UserRole
from utils.auth import token_required

auth_bp = Blueprint("auth", __name__)


def make_token(user):
    payload = {
        "user_id": user.user_id,
        "email": user.email,
        "role": user.role.value,
        "exp": datetime.now(timezone.utc) + timedelta(days=1),
    }
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")


def user_to_dict(user):
    return {
        "user_id": user.user_id,
        "username": user.username,
        "email": user.email,
        "role": user.role.value,
        "room_id": user.room_id,
    }


@auth_bp.route("/signup", methods=["POST"])
def signup():
    """
    Register a new user
    ---
    tags:
      - Authentication
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - username
            - email
            - password
          properties:
            username:
              type: string
              example: "john_doe"
            email:
              type: string
              format: email
              example: "john@example.com"
            password:
              type: string
              format: password
              example: "securepassword123"
            role:
              type: string
              enum: ["student", "admin", "teacher"]
              default: "student"
              example: "student"
    responses:
      201:
        description: User successfully registered
        schema:
          type: object
          properties:
            token:
              type: string
              description: JWT authentication token
            user:
              type: object
              properties:
                user_id:
                  type: integer
                username:
                  type: string
                email:
                  type: string
                role:
                  type: string
                room_id:
                  type: integer
                  nullable: true
      400:
        description: Bad request - missing or invalid required fields
        schema:
          type: object
          properties:
            error:
              type: string
      409:
        description: Conflict - email or username already exists
        schema:
          type: object
          properties:
            error:
              type: string
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "student")

    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required"}), 400

    try:
        user_role = UserRole(role)
    except ValueError:
        return jsonify({"error": f"Invalid role. Must be one of: {[r.value for r in UserRole]}"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already taken"}), 409

    user = User(
        username=username,
        email=email,
        password_hash=generate_password_hash(password),
        role=user_role,
    )
    db.session.add(user)
    db.session.commit()

    token = make_token(user)
    return jsonify({"token": token, "user": user_to_dict(user)}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Authenticate user and get JWT token
    ---
    tags:
      - Authentication
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - email
            - password
          properties:
            email:
              type: string
              format: email
              example: "john@example.com"
            password:
              type: string
              format: password
              example: "securepassword123"
    responses:
      200:
        description: Login successful
        schema:
          type: object
          properties:
            token:
              type: string
              description: JWT authentication token valid for 24 hours
            user:
              type: object
              properties:
                user_id:
                  type: integer
                username:
                  type: string
                email:
                  type: string
                role:
                  type: string
                room_id:
                  type: integer
                  nullable: true
      400:
        description: Bad request - missing required fields
        schema:
          type: object
          properties:
            error:
              type: string
      401:
        description: Unauthorized - invalid email or password
        schema:
          type: object
          properties:
            error:
              type: string
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = make_token(user)
    return jsonify({"token": token, "user": user_to_dict(user)}), 200


@auth_bp.route("/me", methods=["GET"])
@token_required
def me():
    """
    Get current user information
    ---
    tags:
      - Authentication
    security:
      - Bearer: []
    responses:
      200:
        description: Current user information
        schema:
          type: object
          properties:
            user:
              type: object
              properties:
                user_id:
                  type: integer
                username:
                  type: string
                email:
                  type: string
                role:
                  type: string
                room_id:
                  type: integer
                  nullable: true
      401:
        description: Unauthorized - invalid or missing token
        schema:
          type: object
          properties:
            error:
              type: string
    """
    return jsonify({"user": user_to_dict(request.current_user)}), 200
