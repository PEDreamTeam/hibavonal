from flask import Blueprint, request, jsonify

from app import db
from models import Room
from utils.auth import role_required

rooms_bp = Blueprint("rooms", __name__)


def room_to_dict(room):
    return {
        "room_id": room.room_id,
        "name": room.name,
        "notes": room.notes,
    }


@rooms_bp.route("", methods=["GET"])
@role_required("admin")
def get_rooms():
    """
    Get all rooms
    ---
    tags:
      - Rooms
    security:
      - Bearer: []
    responses:
      200:
        description: List of all rooms
        schema:
          type: array
          items:
            type: object
            properties:
              room_id:
                type: integer
              name:
                type: string
              notes:
                type: string
                nullable: true
      401:
        description: Unauthorized - invalid or missing token
        schema:
          type: object
          properties:
            error:
              type: string
      403:
        description: Forbidden - insufficient permissions (admin role required)
        schema:
          type: object
          properties:
            error:
              type: string
    """
    rooms = Room.query.all()
    return jsonify([room_to_dict(r) for r in rooms]), 200


@rooms_bp.route("", methods=["POST"])
@role_required("admin")
def create_room():
    """
    Create a new room
    ---
    tags:
      - Rooms
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - name
          properties:
            name:
              type: string
              example: "Room 101"
            notes:
              type: string
              nullable: true
              example: "Biology lab"
    responses:
      201:
        description: Room successfully created
        schema:
          type: object
          properties:
            room_id:
              type: integer
            name:
              type: string
            notes:
              type: string
              nullable: true
      400:
        description: Bad request - missing or invalid required fields
        schema:
          type: object
          properties:
            error:
              type: string
      401:
        description: Unauthorized - invalid or missing token
        schema:
          type: object
          properties:
            error:
              type: string
      403:
        description: Forbidden - insufficient permissions (admin role required)
        schema:
          type: object
          properties:
            error:
              type: string
    """
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
def update_room(room_id):
    """
    Update an existing room
    ---
    tags:
      - Rooms
    security:
      - Bearer: []
    parameters:
      - in: path
        name: room_id
        type: integer
        required: true
        description: ID of the room to update
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
              example: "Room 101 Updated"
            notes:
              type: string
              nullable: true
              example: "Updated notes"
    responses:
      200:
        description: Room successfully updated
        schema:
          type: object
          properties:
            room_id:
              type: integer
            name:
              type: string
            notes:
              type: string
              nullable: true
      400:
        description: Bad request - invalid request body
        schema:
          type: object
          properties:
            error:
              type: string
      401:
        description: Unauthorized - invalid or missing token
        schema:
          type: object
          properties:
            error:
              type: string
      403:
        description: Forbidden - insufficient permissions (admin role required)
        schema:
          type: object
          properties:
            error:
              type: string
      404:
        description: Not found - room does not exist
        schema:
          type: object
          properties:
            error:
              type: string
    """
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
def delete_room(room_id):
    """
    Delete a room
    ---
    tags:
      - Rooms
    security:
      - Bearer: []
    parameters:
      - in: path
        name: room_id
        type: integer
        required: true
        description: ID of the room to delete
    responses:
      200:
        description: Room successfully deleted
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Room deleted"
      401:
        description: Unauthorized - invalid or missing token
        schema:
          type: object
          properties:
            error:
              type: string
      403:
        description: Forbidden - insufficient permissions (admin role required)
        schema:
          type: object
          properties:
            error:
              type: string
      404:
        description: Not found - room does not exist
        schema:
          type: object
          properties:
            error:
              type: string
      409:
        description: Conflict - cannot delete room with assigned users or associated tickets
        schema:
          type: object
          properties:
            error:
              type: string
    """
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
