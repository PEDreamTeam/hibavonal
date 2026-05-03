from flasgger import swag_from
from flask import Blueprint, jsonify, request

from models import db, TicketType, TicketTypeTool, Tool
from utils.auth import role_required
from utils.docs import doc_path

ticket_types_bp = Blueprint("ticket_types", __name__, url_prefix="/api/ticket-types")


@ticket_types_bp.route("", methods=["GET"])
@swag_from(doc_path("ticket_types", "get_ticket_types.yml"))
def get_ticket_types():
    ticket_types = TicketType.query.all()
    result = []
    for ticket_type in ticket_types:
        result.append(
            {
                "ticket_type_id": ticket_type.ticket_type_id,
                "name": ticket_type.name,
                "details": ticket_type.details,
                "tool_ids": [relation.tool_id for relation in ticket_type.ticket_type_tools],
            }
        )
    return jsonify(result), 200


@ticket_types_bp.route("", methods=["POST"])
@role_required("admin")
@swag_from(doc_path("ticket_types", "create_ticket_type.yml"))
def create_ticket_type():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    name = data.get("name")
    details = data.get("details")
    tool_ids = data.get("tool_ids", [])

    if not name or not name.strip():
        return jsonify({"error": "Ticket type name is required"}), 400

    if tool_ids is not None and not isinstance(tool_ids, list):
        return jsonify({"error": "tool_ids must be a list of integers"}), 400

    tools = []
    for tool_id in tool_ids:
        if not isinstance(tool_id, int):
            return jsonify({"error": "tool_ids must contain integer tool IDs"}), 400
        tool = Tool.query.get(tool_id)
        if not tool:
            return jsonify({"error": f"Tool with ID {tool_id} does not exist"}), 400
        tools.append(tool)

    ticket_type = TicketType(name=name.strip(), details=details)
    db.session.add(ticket_type)
    db.session.flush()

    for tool in tools:
        db.session.add(
            TicketTypeTool(ticket_type_id=ticket_type.ticket_type_id, tool_id=tool.tool_id)
        )

    db.session.commit()

    return (
        jsonify(
            {
                "message": "Ticket type created successfully",
                "ticket_type_id": ticket_type.ticket_type_id,
            }
        ),
        201,
    )
