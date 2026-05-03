from flask import Blueprint, jsonify, request

from extensions import db
from models import Ticket, TicketStatus
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
@role_required("student", "maintainer", "maintenance_manager", "admin")
def get_tickets():
    user = request.current_user
    if user.role.value == "student":
        tickets = Ticket.query.filter_by(student_id=user.user_id, is_deleted=False).all()
    elif user.role.value == "maintainer":
        tickets = Ticket.query.filter_by(maintainer_id=user.user_id, is_deleted=False).all()
    else:
        tickets = Ticket.query.filter_by(is_deleted=False).all()
    return jsonify([ticket_to_dict(t) for t in tickets]), 200


@tickets_bp.route("", methods=["POST"])
@role_required("student")
def create_ticket():
    user = request.current_user
    data = request.get_json()

    room_id = data.get("room_id")
    ticket_type_id = data.get("ticket_type_id")
    maintainer_id = data.get("maintainer_id")
    details = data.get("details", "").strip()
    priority = data.get("priority")

    if not all([room_id, ticket_type_id, maintainer_id, details, priority is not None]):
        return jsonify({"error": "Missing required fields"}), 400

    if not isinstance(priority, int) or not (0 <= priority <= 5):
        return jsonify({"error": "Priority must be an integer between 0 and 5"}), 400

    ticket = Ticket(
        room_id=room_id,
        student_id=user.user_id,
        maintainer_id=maintainer_id,
        ticket_type_id=ticket_type_id,
        details=details,
        priority=priority,
        status=TicketStatus.in_progress,
        is_deleted=False,
    )
    db.session.add(ticket)
    db.session.commit()
    return jsonify(ticket_to_dict(ticket)), 201


@tickets_bp.route("/<int:ticket_id>/status", methods=["PUT"])
@role_required("maintenance_manager", "admin")
def update_ticket_status(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket or ticket.is_deleted:
        return jsonify({"error": "Ticket not found"}), 404

    data = request.get_json()
    new_status = data.get("status")
    valid_statuses = [s.value for s in TicketStatus]
    if not new_status or new_status not in valid_statuses:
        return jsonify({"error": f"Invalid status. Must be one of: {valid_statuses}"}), 400

    ticket.status = TicketStatus(new_status)
    db.session.commit()
    return jsonify(ticket_to_dict(ticket)), 200

