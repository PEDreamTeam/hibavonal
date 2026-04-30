from flask import Blueprint, jsonify, request
from models import db, ToolOrder, ToolOrderStatus, Tool

tool_orders_bp = Blueprint("tool_orders", __name__, url_prefix="/tool-orders")


@tool_orders_bp.route("", methods=["GET"])
def get_tool_orders():
    """
    Get all tool orders
    ---
    tags:
      - ToolOrders
    responses:
      200:
        description: List of all tool orders
        schema:
          type: array
          items:
            type: object
            properties:
              tool_order_id:
                type: integer
              tool_id:
                type: integer
              tool_name:
                type: string
                nullable: true
              name:
                type: string
              details:
                type: string
                nullable: true
              status:
                type: string
    """
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
def get_tool_order(tool_order_id):
    """
    Get a single tool order by ID
    ---
    tags:
      - ToolOrders
    parameters:
      - in: path
        name: tool_order_id
        type: integer
        required: true
        description: ID of the tool order to retrieve
    responses:
      200:
        description: Tool order details
        schema:
          type: object
          properties:
            tool_order_id:
              type: integer
            tool_id:
              type: integer
            tool_name:
              type: string
              nullable: true
            name:
              type: string
            details:
              type: string
              nullable: true
            status:
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

    return jsonify(
        {
            "tool_order_id": order.tool_order_id,
            "tool_id": order.tool_id,
            "tool_name": order.tool.name if order.tool else None,
            "name": order.name,
            "details": order.details,
            "status": order.status.value if order.status else None,
        }
    ), 200


@tool_orders_bp.route("", methods=["POST"])
def create_tool_order():
    """
    Create a new tool order
    ---
    tags:
      - ToolOrders
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
              example: "New screwdriver"
            details:
              type: string
              nullable: true
              example: "Include Phillips head"
            status:
              type: string
              enum: [ordered, ready]
              example: ordered
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
        description: Bad request - missing or invalid required fields
        schema:
          type: object
          properties:
            error:
              type: string
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    tool_id = data.get("tool_id")
    name = data.get("name")
    details = data.get("details")
    status = data.get("status", "ordered")

    if not tool_id:
        return jsonify({"error": "tool_id is required"}), 400

    if not name:
        return jsonify({"error": "name is required"}), 400

    tool = Tool.query.get(tool_id)
    if not tool:
        return jsonify({"error": "Referenced tool does not exist"}), 400

    try:
        status_enum = ToolOrderStatus(status)
    except ValueError:
        return jsonify({"error": "Invalid status"}), 400

    new_order = ToolOrder(
        tool_id=tool_id,
        name=name,
        details=details,
        status=status_enum,
    )

    db.session.add(new_order)
    db.session.commit()

    return jsonify(
        {
            "message": "Tool order created successfully",
            "tool_order_id": new_order.tool_order_id,
        }
    ), 201