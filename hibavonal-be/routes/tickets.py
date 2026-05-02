from flask import Blueprint, request, jsonify

from extensions import db
from models import Ticket, TicketType, Room, User
from utils.auth import token_required

tickets_bp = Blueprint("tickets", __name__)


def ticket_to_dict(ticket):
    return {
        "ticket_id": ticket.ticket_id,
        "room_id": ticket.room_id,
        "student_id": ticket.student_id,
        "maintainer_id": ticket.maintainer_id,
        "ticket_type_id": ticket.ticket_type_id,
        "details": ticket.details,
        "status": ticket.status.value,
        "priority": ticket.priority,
    }


@tickets_bp.route("/create", methods=["POST"])
@token_required
def create_ticket():
    """
    Create a new ticket
    ---
    tags:
      - Tickets
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - room_id
            - ticket_type_id
            - maintainer_id
            - details
            - priority
          properties:
            room_id:
              type: integer
              example: 1
            ticket_type_id:
              type: integer
              example: 1
            maintainer_id:
              type: integer
              example: 2
            details:
              type: string
              example: "Door lock is broken"
            priority:
              type: integer
              minimum: 0
              maximum: 5
              example: 3
    responses:
      201:
        description: Ticket successfully created
        schema:
          type: object
          properties:
            ticket_id:
              type: integer
            room_id:
              type: integer
            student_id:
              type: integer
            maintainer_id:
              type: integer
            ticket_type_id:
              type: integer
            details:
              type: string
            status:
              type: string
            priority:
              type: integer
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
        description: Forbidden - insufficient permissions
        schema:
          type: object
          properties:
            error:
              type: string
      500:
        description: Internal server error
        schema:
          type: object
          properties:
            error:
              type: string
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Request body is required"}), 400

        room_id = data.get("room_id")
        ticket_type_id = data.get("ticket_type_id")
        maintainer_id = data.get("maintainer_id")
        details = data.get("details")
        priority = data.get("priority")

        if not room_id or not ticket_type_id or not maintainer_id or not details or priority is None:
            return jsonify({"error": "All fields are required: room_id, ticket_type_id, maintainer_id, details, priority"}), 400

        if not isinstance(priority, int) or priority < 0 or priority > 5:
            return jsonify({"error": "Priority must be an integer between 0 and 5"}), 400

        room = Room.query.get(room_id)
        if not room:
            return jsonify({"error": "Room not found"}), 400

        ticket_type = TicketType.query.get(ticket_type_id)
        if not ticket_type:
            return jsonify({"error": "Ticket type not found"}), 400

        maintainer = User.query.get(maintainer_id)
        if not maintainer:
            return jsonify({"error": "Maintainer not found"}), 400

        ticket = Ticket(
            room_id=room_id,
            student_id=request.current_user.user_id,
            maintainer_id=maintainer_id,
            ticket_type_id=ticket_type_id,
            details=details,
            priority=priority,
        )

        db.session.add(ticket)
        db.session.commit()

        return jsonify(ticket_to_dict(ticket)), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
