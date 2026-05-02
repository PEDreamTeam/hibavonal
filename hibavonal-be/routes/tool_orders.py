from flask import Blueprint, jsonify, request
from models import db, ToolOrder, ToolOrderStatus, Tool, UserRole
from utils.auth import token_required

tool_orders_bp = Blueprint("tool_orders", __name__, url_prefix="/tool-orders")


@tool_orders_bp.route("/list", methods=["GET"])
@token_required
def get_tool_orders_list():
    """
    Get list of tool orders with role-based filtering and sorting
    ---
    tags:
      - Tool Orders
    security:
      - Bearer: []
    parameters:
      - in: query
        name: sort_by
        type: string
        enum: ["created_at", "name", "status"]
        default: "created_at"
        description: Field to sort by
      - in: query
        name: sort_order
        type: string
        enum: ["asc", "desc"]
        default: "desc"
        description: Sort order
      - in: query
        name: status
        type: string
        enum: ["ordered", "ready"]
        description: Filter by status
    responses:
      200:
        description: List of tool orders visible to user
        schema:
          type: array
          items:
            type: object
            properties:
              tool_order_id:
                type: integer
              tool_name:
                type: string
              name:
                type: string
              details:
                type: string
                nullable: true
              status:
                type: string
              created_by:
                type: string
              created_at:
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
    """
    current_user = request.current_user

    if current_user.role not in [UserRole.maintainer, UserRole.maintenance_manager]:
        return jsonify({"error": "Insufficient permissions"}), 403

    query = ToolOrder.query

    if current_user.role == UserRole.maintainer:
        query = query.filter_by(created_by_id=current_user.user_id)

    status_filter = request.args.get("status")
    if status_filter:
        try:
            status_enum = ToolOrderStatus(status_filter)
            query = query.filter_by(status=status_enum)
        except ValueError:
            return jsonify({"error": f"Invalid status filter. Must be one of: {[s.value for s in ToolOrderStatus]}"}), 400

    sort_by = request.args.get("sort_by", "created_at")
    sort_order = request.args.get("sort_order", "desc")

    if sort_by not in ["created_at", "name", "status"]:
        return jsonify({"error": "Invalid sort_by. Must be one of: created_at, name, status"}), 400

    if sort_order not in ["asc", "desc"]:
        return jsonify({"error": "Invalid sort_order. Must be asc or desc"}), 400

    if sort_by == "created_at":
        query = query.order_by(ToolOrder.created_at.desc() if sort_order == "desc" else ToolOrder.created_at.asc())
    elif sort_by == "name":
        query = query.order_by(ToolOrder.name.desc() if sort_order == "desc" else ToolOrder.name.asc())
    elif sort_by == "status":
        query = query.order_by(ToolOrder.status.desc() if sort_order == "desc" else ToolOrder.status.asc())

    tool_orders = query.all()

    result = []
    for order in tool_orders:
        result.append(
            {
                "tool_order_id": order.tool_order_id,
                "tool_name": order.tool.name if order.tool else None,
                "name": order.name,
                "details": order.details,
                "status": order.status.value if order.status else None,
                "created_by": order.created_by.username if order.created_by else None,
                "created_at": order.created_at.isoformat() if order.created_at else None,
            }
        )

    return jsonify(result), 200


@tool_orders_bp.route("", methods=["GET"])
@token_required
def get_tool_orders():
    tool_orders = ToolOrder.query.all()

    result = []
    for order in tool_orders:
        result.append(
            {
                "tool_order_id": order.tool_order_id,
                "tool_id": order.tool_id,
                "tool_name": order.tool.name if order.tool else None,
                "name": order.name,
                "details": order.details,
                "status": order.status.value if order.status else None,
            }
        )

    return jsonify(result), 200


@tool_orders_bp.route("/<int:tool_order_id>", methods=["GET"])
@token_required
def get_tool_order(tool_order_id):
    order = ToolOrder.query.get(tool_order_id)

    if not order:
        return jsonify({"error": "Tool order not found"}), 404

    current_user = request.current_user
    if current_user.role == UserRole.maintainer and order.created_by_id != current_user.user_id:
        return jsonify({"error": "Insufficient permissions"}), 403

    return jsonify(
        {
            "tool_order_id": order.tool_order_id,
            "tool_id": order.tool_id,
            "tool_name": order.tool.name if order.tool else None,
            "name": order.name,
            "details": order.details,
            "status": order.status.value if order.status else None,
            "created_by": order.created_by.username if order.created_by else None,
            "created_at": order.created_at.isoformat() if order.created_at else None,
        }
    ), 200


@tool_orders_bp.route("/<int:tool_order_id>", methods=["PUT"])
@token_required
def update_tool_order(tool_order_id):
    """
    Update tool order status
    ---
    tags:
      - Tool Orders
    security:
      - Bearer: []
    parameters:
      - in: path
        name: tool_order_id
        type: integer
        required: true
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            status:
              type: string
              enum: ["ordered", "ready"]
              example: "ready"
    responses:
      200:
        description: Tool order successfully updated
        schema:
          type: object
          properties:
            message:
              type: string
      400:
        description: Bad request - invalid status
        schema:
          type: object
          properties:
            error:
              type: string
      401:
        description: Unauthorized
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
      404:
        description: Tool order not found
        schema:
          type: object
          properties:
            error:
              type: string
    """
    order = ToolOrder.query.get(tool_order_id)

    if not order:
        return jsonify({"error": "Tool order not found"}), 404

    current_user = request.current_user
    if current_user.role not in [UserRole.maintainer, UserRole.maintenance_manager]:
        return jsonify({"error": "Insufficient permissions"}), 403

    if current_user.role == UserRole.maintainer and order.created_by_id != current_user.user_id:
        return jsonify({"error": "Insufficient permissions"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    status = data.get("status")
    if not status:
        return jsonify({"error": "Status is required"}), 400

    try:
        status_enum = ToolOrderStatus(status)
    except ValueError:
        return jsonify({"error": f"Invalid status. Must be one of: {[s.value for s in ToolOrderStatus]}"}), 400

    order.status = status_enum
    db.session.commit()

    return jsonify({"message": "Tool order updated successfully"}), 200


@tool_orders_bp.route("/<int:tool_order_id>", methods=["DELETE"])
@token_required
def delete_tool_order(tool_order_id):
    """
    Delete tool order
    ---
    tags:
      - Tool Orders
    security:
      - Bearer: []
    parameters:
      - in: path
        name: tool_order_id
        type: integer
        required: true
    responses:
      200:
        description: Tool order successfully deleted
        schema:
          type: object
          properties:
            message:
              type: string
      401:
        description: Unauthorized
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
      404:
        description: Tool order not found
        schema:
          type: object
          properties:
            error:
              type: string
    """
    order = ToolOrder.query.get(tool_order_id)

    if not order:
        return jsonify({"error": "Tool order not found"}), 404

    current_user = request.current_user
    if current_user.role not in [UserRole.maintainer, UserRole.maintenance_manager]:
        return jsonify({"error": "Insufficient permissions"}), 403

    if current_user.role == UserRole.maintainer and order.created_by_id != current_user.user_id:
        return jsonify({"error": "Insufficient permissions"}), 403

    db.session.delete(order)
    db.session.commit()

    return jsonify({"message": "Tool order deleted successfully"}), 200


@tool_orders_bp.route("", methods=["POST"])
@token_required
def create_tool_order():
    """
    Create a new tool order
    ---
    tags:
      - Tool Orders
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - tool_id
            - name
          properties:
            tool_id:
              type: integer
              example: 1
            name:
              type: string
              example: "Order drill bits"
            details:
              type: string
              nullable: true
              example: "High-speed bits"
            status:
              type: string
              enum: ["ordered", "ready"]
              default: "ordered"
              example: "ordered"
    responses:
      201:
        description: Tool order created successfully
        schema:
          type: object
          properties:
            message:
              type: string
            tool_order_id:
              type: integer
      400:
        description: Bad request - missing or invalid fields
        schema:
          type: object
          properties:
            error:
              type: string
      401:
        description: Unauthorized
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

        tool_id = data.get("tool_id")
        name = data.get("name")
        details = data.get("details", "")
        status = data.get("status", "ordered")

        if not tool_id:
            return jsonify({"error": "tool_id is required"}), 400

        if not isinstance(tool_id, int):
            return jsonify({"error": "tool_id must be an integer"}), 400

        if not name or not isinstance(name, str) or len(name.strip()) == 0:
            return jsonify({"error": "name is required and must be a non-empty string"}), 400

        tool = Tool.query.get(tool_id)
        if not tool:
            return jsonify({"error": "Tool not found"}), 400

        try:
            status_enum = ToolOrderStatus(status)
        except ValueError:
            return jsonify({"error": f"Invalid status. Must be one of: {[s.value for s in ToolOrderStatus]}"}), 400

        new_order = ToolOrder(
            tool_id=tool_id,
            name=name.strip(),
            details=details.strip() if details else None,
            status=status_enum,
            created_by_id=request.current_user.user_id,
        )

        db.session.add(new_order)
        db.session.commit()

        return jsonify(
            {
                "message": "Tool order created successfully",
                "tool_order_id": new_order.tool_order_id,
            }
        ), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500