from flasgger import swag_from
from flask import Blueprint, request, jsonify

from extensions import db
from models import StudentFeedback, Ticket
from utils.auth import role_required
from utils.docs import doc_path

student_feedback_bp = Blueprint("student_feedback", __name__, url_prefix="/api/student-feedback")


def student_feedback_to_dict(feedback):
    return {
        "student_feedback_id": feedback.student_feedback_id,
        "ticket_id": feedback.ticket_id,
        "details": feedback.details,
    }


@student_feedback_bp.route("", methods=["POST"])
@role_required("student")
@swag_from(doc_path("student_feedback", "create_student_feedback.yml"))
def create_student_feedback():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    ticket_id = data.get("ticket_id")
    details = data.get("details")

    if ticket_id is None:
        return jsonify({"error": "ticket_id is required"}), 400

    try:
        ticket_id = int(ticket_id)
    except (TypeError, ValueError):
        return jsonify({"error": "ticket_id must be an integer"}), 400

    if not details or not isinstance(details, str) or not details.strip():
        return jsonify({"error": "details is required"}), 400

    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404

    if ticket.student_id != request.current_user.user_id:
        return jsonify({"error": "You can only submit feedback for your own ticket"}), 403

    existing_feedback = StudentFeedback.query.filter_by(ticket_id=ticket_id).first()
    if existing_feedback:
        return jsonify({"error": "Feedback already exists for this ticket"}), 409

    feedback = StudentFeedback(ticket_id=ticket_id, details=details.strip())
    db.session.add(feedback)
    db.session.commit()

    return jsonify(student_feedback_to_dict(feedback)), 201
