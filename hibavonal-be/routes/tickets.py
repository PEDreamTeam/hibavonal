from flasgger import swag_from
from flask import Blueprint, jsonify, request

from extensions import db
from models import Ticket, TicketStatus, Tool, TicketTypeTool
from utils.auth import role_required
from utils.docs import doc_path

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


def ticket_to_dict_with_tools(ticket):
    result = ticket_to_dict(ticket)
    result["tools"] = [
        {"tool_id": tt.tool.tool_id, "name": tt.tool.name}
        for tt in ticket.ticket_type.ticket_type_tools
    ] if ticket.ticket_type else []
    return result


@tickets_bp.route("", methods=["GET"])
@role_required("student", "maintainer", "maintenance_manager", "admin")
@swag_from(doc_path("tickets", "get_tickets.yml"))
def get_tickets():
    user = request.current_user
    if user.role.value == "student":
        tickets = Ticket.query.filter_by(student_id=user.user_id, is_deleted=False).all()
    elif user.role.value == "maintainer":
        tickets = Ticket.query.filter_by(maintainer_id=user.user_id, is_deleted=False).all()
    else:
        tickets = Ticket.query.filter_by(is_deleted=False).all()
    return jsonify([ticket_to_dict(t) for t in tickets]), 200


@tickets_bp.route("/<int:ticket_id>", methods=["GET"])
@role_required("student", "maintainer", "maintenance_manager", "admin")
@swag_from(doc_path("tickets", "get_ticket.yml"))
def get_ticket(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket or ticket.is_deleted:
        return jsonify({"error": "Ticket not found"}), 404
    return jsonify(ticket_to_dict_with_tools(ticket)), 200


@tickets_bp.route("", methods=["POST"])
@role_required("student")
@swag_from(doc_path("tickets", "create_ticket.yml"))
def create_ticket():
    user = request.current_user
    data = request.get_json()

    room_id = data.get("room_id")
    details = data.get("details", "").strip()
    priority = data.get("priority")

    if not all([room_id, details, priority is not None]):
        return jsonify({"error": "Missing required fields"}), 400

    if not isinstance(priority, int) or not (0 <= priority <= 5):
        return jsonify({"error": "Priority must be an integer between 0 and 5"}), 400

    ticket = Ticket(
        room_id=room_id,
        student_id=user.user_id,
        maintainer_id=None,
        ticket_type_id=None,
        details=details,
        priority=priority,
        status=TicketStatus.created,
        is_deleted=False,
    )
    db.session.add(ticket)
    db.session.commit()
    return jsonify(ticket_to_dict(ticket)), 201


@tickets_bp.route("/<int:ticket_id>/status", methods=["PUT"])
@role_required("maintenance_manager", "admin", "maintainer")
@swag_from(doc_path("tickets", "update_ticket_status.yml"))
def update_ticket_status(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket or ticket.is_deleted:
        return jsonify({"error": "Ticket not found"}), 404

    user = request.current_user
    data = request.get_json()
    new_status = data.get("status")

    if user.role.value == "maintainer":
        if ticket.maintainer_id != user.user_id:
            return jsonify({"error": "Insufficient permissions"}), 403
        if new_status != "ready_to_done":
            return jsonify({"error": "Maintainer can only set status to ready_to_done"}), 403
    else:
        if new_status != "done":
            return jsonify({"error": "Maintenance manager can only set status to done"}), 403

    try:
        ticket.status = TicketStatus(new_status)
    except ValueError:
        return jsonify({"error": f"Invalid status"}), 400

    db.session.commit()
    return jsonify(ticket_to_dict(ticket)), 200


@tickets_bp.route("/<int:ticket_id>/maintainer", methods=["PUT"])
@role_required("maintenance_manager", "admin")
@swag_from(doc_path("tickets", "assign_maintainer.yml"))
def assign_maintainer(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket or ticket.is_deleted:
        return jsonify({"error": "Ticket not found"}), 404

    data = request.get_json()
    maintainer_id = data.get("maintainer_id")

    if maintainer_id is not None:
        from models import User, UserRole
        maintainer = User.query.get(maintainer_id)
        if not maintainer:
            return jsonify({"error": "User not found"}), 404
        if maintainer.role != UserRole.maintainer:
            return jsonify({"error": "User is not a maintainer"}), 400

    ticket.maintainer_id = maintainer_id
    if maintainer_id is not None:
        ticket.status = TicketStatus.in_progress
    db.session.commit()
    return jsonify(ticket_to_dict(ticket)), 200


@tickets_bp.route("/<int:ticket_id>/ticket-type", methods=["PUT"])
@role_required("maintainer", "maintenance_manager")
@swag_from(doc_path("tickets", "update_ticket_type.yml"))
def update_ticket_type(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket or ticket.is_deleted:
        return jsonify({"error": "Ticket not found"}), 404

    data = request.get_json()
    ticket_type_id = data.get("ticket_type_id")
    if not ticket_type_id:
        return jsonify({"error": "ticket_type_id is required"}), 400

    from models import TicketType
    ticket_type = TicketType.query.get(ticket_type_id)
    if not ticket_type:
        return jsonify({"error": "Ticket type not found"}), 404

    ticket.ticket_type_id = ticket_type_id
    db.session.commit()
    return jsonify(ticket_to_dict_with_tools(ticket)), 200


@tickets_bp.route("/<int:ticket_id>", methods=["DELETE"])
@role_required("maintenance_manager", "admin")
def archive_ticket(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket or ticket.is_deleted:
        return jsonify({"error": "Ticket not found"}), 404

    ticket.is_deleted = True
    db.session.commit()
    return jsonify({"message": "Ticket archived"}), 200


@tickets_bp.route("/<int:ticket_id>/tools/<int:tool_id>", methods=["DELETE"])
@role_required("maintainer")
@swag_from(doc_path("tickets", "remove_tool_from_ticket.yml"))
def remove_tool_from_ticket(ticket_id, tool_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket or ticket.is_deleted:
        return jsonify({"error": "Ticket not found"}), 404

    association = TicketTypeTool.query.filter_by(
        ticket_type_id=ticket.ticket_type_id, tool_id=tool_id
    ).first()
    if not association:
        return jsonify({"error": "Tool not assigned to this ticket type"}), 404

    db.session.delete(association)
    db.session.commit()
    return jsonify(ticket_to_dict_with_tools(ticket)), 200
