def format_tool_order(order):
    """
    Format tool order for API response.
    """
    return {
        "tool_order_id": order.tool_order_id,
        "tool_id": order.tool_id,
        "tool_name": order.tool.name if order.tool else None,
        "name": order.name,
        "details": order.details,
        "status": order.status.value if order.status else None,
        "created_by": order.created_by.username if order.created_by else None,
        "created_by_id": order.created_by_id,
        "created_at": order.created_at.isoformat() if order.created_at else None,
    }
