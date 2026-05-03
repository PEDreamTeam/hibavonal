from flask import Blueprint, jsonify, request

from extensions import db
from models import User, UserRole, Room
from utils.auth import token_required, role_required

users_bp = Blueprint("users", __name__, url_prefix="/api/users")


@users_bp.route("/maintainers", methods=["GET"])
@token_required
def get_maintainers():
    maintainers = User.query.filter_by(role=UserRole.maintainer).all()
    return jsonify([{"user_id": u.user_id, "username": u.username} for u in maintainers]), 200


@users_bp.route("/students", methods=["GET"])
@role_required("admin")
def get_students():
    students = User.query.filter_by(role=UserRole.student).all()
    return jsonify([
        {
            "user_id": u.user_id,
            "username": u.username,
            "email": u.email,
            "room_id": u.room_id,
            "room_name": u.room.name if u.room else None,
        }
        for u in students
    ]), 200


@users_bp.route("/<int:user_id>/room", methods=["PUT"])
@role_required("admin")
def assign_user_room(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    if user.role != UserRole.student:
        return jsonify({"error": "Can only assign rooms to students"}), 400

    data = request.get_json()
    room_id = data.get("room_id")

    if room_id is not None:
        room = Room.query.get(room_id)
        if not room:
            return jsonify({"error": "Room not found"}), 404

    user.room_id = room_id
    db.session.commit()
    return jsonify({
        "user_id": user.user_id,
        "username": user.username,
        "room_id": user.room_id,
        "room_name": user.room.name if user.room else None,
    }), 200
