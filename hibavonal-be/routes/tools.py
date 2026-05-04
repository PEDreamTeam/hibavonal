from flasgger import swag_from
from flask import Blueprint, jsonify, request
from extensions import db
from models import Tool
from utils.auth import role_required
from utils.docs import doc_path

tools_bp = Blueprint("tools", __name__, url_prefix="/api/tools")


@tools_bp.route("", methods=["GET"])
@role_required("maintainer", "maintenance_manager", "admin")
@swag_from(doc_path("tools", "get_tools.yml"))
def get_tools():
    tools = Tool.query.all()
    return jsonify([{"tool_id": t.tool_id, "name": t.name} for t in tools]), 200


@tools_bp.route("", methods=["POST"])
@role_required("admin")
@swag_from(doc_path("tools", "create_tool.yml"))
def create_tool():
    data = request.get_json()
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "name is required"}), 400
    tool = Tool(name=name)
    db.session.add(tool)
    db.session.commit()
    return jsonify({"tool_id": tool.tool_id, "name": tool.name}), 201