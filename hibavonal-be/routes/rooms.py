from flasgger import swag_from
from flask import Blueprint, request, jsonify

from extensions import db
from models import Room
from utils.auth import role_required
from utils.docs import doc_path

rooms_bp = Blueprint("rooms", __name__)


def room_to_dict(room):
    return {
        "room_id": room.room_id,
        "name": room.name,
        "notes": room.notes,
    }


@rooms_bp.route("", methods=["GET"])
@role_required("admin", "maintainer", "maintenance_manager", "student")
@swag_from(doc_path("rooms", "get_rooms.yml"))
def get_rooms():
    rooms = Room.query.all()
    return jsonify([room_to_dict(r) for r in rooms]), 200


@rooms_bp.route("", methods=["POST"])
@role_required("admin")
@swag_from(doc_path("rooms", "create_room.yml"))
def create_room():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    name = data.get("name")
    if not name:
        return jsonify({"error": "Room name is required"}), 400

    room = Room(name=name, notes=data.get("notes"))
    db.session.add(room)
    db.session.commit()

    return jsonify(room_to_dict(room)), 201


@rooms_bp.route("/<int:room_id>", methods=["PUT"])
@role_required("admin")
@swag_from(doc_path("rooms", "update_room.yml"))
def update_room(room_id):
    room = Room.query.get(room_id)
    if not room:
        return jsonify({"error": "Room not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    if "name" in data:
        if not data["name"]:
            return jsonify({"error": "Room name cannot be empty"}), 400
        room.name = data["name"]

    if "notes" in data:
        room.notes = data["notes"]

    db.session.commit()
    return jsonify(room_to_dict(room)), 200


@rooms_bp.route("/<int:room_id>", methods=["DELETE"])
@role_required("admin")
@swag_from(doc_path("rooms", "delete_room.yml"))
def delete_room(room_id):
    room = Room.query.get(room_id)
    if not room:
        return jsonify({"error": "Room not found"}), 404

    if room.user:
        return jsonify({"error": "Cannot delete room with assigned users"}), 409

    if room.ticket:
        return jsonify({"error": "Cannot delete room with associated tickets"}), 409

    db.session.delete(room)
    db.session.commit()
    return jsonify({"message": "Room deleted"}), 200
