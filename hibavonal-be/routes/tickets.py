from flask import Blueprint, jsonify

from extensions import db
from models import Ticket
from utils.auth import role_required

tickets_bp = Blueprint("tickets", __name__, url_prefix="/api/tickets")


def ticket_to_dict(ticket):
    return {
        "ticket_id": ticket.ticket_id,
        "room_id": ticket.room_id,
        "room_name": ticket.room.name if ticket.room else None,
        "student_id": ticket.student_id,
        "student_username": ticket.student.username if ticket.student else None,
        "maintainer_id": ticket.maintainer_id,
        "maintainer_username": ticket.maintainer.username if ticket.maintainer else None,
        "ticket_type_id": ticket.ticket_type_id,
        "ticket_type_name": ticket.ticket_type.name if ticket.ticket_type else None,
        "details": ticket.details,
        "status": ticket.status.value,
        "priority": ticket.priority,
        "is_deleted": ticket.is_deleted,
        "feedback": {
            "student_feedback_id": ticket.student_feedback.student_feedback_id,
            "details": ticket.student_feedback.details,
        } if ticket.student_feedback else None,
    }


@tickets_bp.route("", methods=["GET"])
@role_required("student")
def get_student_tickets():
    """
    Get all tickets for the authenticated student
    ---
    tags:
      - Tickets
    security:
      - Bearer: []
    responses:
      200:
        description: List of tickets for the student
        schema:
          type: array
          items:
            type: object
            properties:
              ticket_id:
                type: integer
              room_id:
                type: integer
              room_name:
                type: string
              student_id:
                type: integer
              student_username:
                type: string
              maintainer_id:
                type: integer
              maintainer_username:
                type: string
              ticket_type_id:
                type: integer
              ticket_type_name:
                type: string
              details:
                type: string
              status:
                type: string
              priority:
                type: integer
              is_deleted:
                type: boolean
              feedback:
                type: object
                nullable: true
                properties:
                  student_feedback_id:
                    type: integer
                  details:
                    type: string
      401:
        description: Unauthorized - invalid or missing token
        schema:
          type: object
          properties:
            error:
              type: string
      403:
        description: Forbidden - insufficient permissions (student role required)
        schema:
          type: object
          properties:
            error:
              type: string
    """
    tickets = Ticket.query.filter_by(student_id=request.current_user.user_id, is_deleted=False).all()
    return jsonify([ticket_to_dict(t) for t in tickets]), 200
