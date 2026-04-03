import enum

from sqlalchemy import CheckConstraint
from app import db

class UserRole(enum.Enum):
    student = "student"
    admin = "admin"
    maintainer = "maintainer"
    maintenance_manager = "maintenance_manager"
    
class TicketStatus(enum.Enum):
    in_progress = "in_progress"
    done = "done"
    
class ToolOrderStatus(enum.Enum):
    ordered = "ordered"
    ready = "ready"
    
class Room(db.Model):
    __tablename__ = "room"

    room_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    notes = db.Column(db.String(255), nullable=True)

    user = db.relationship("User", back_populates="room", lazy=True)
    ticket = db.relationship("Ticket", back_populates="room", lazy=True)

class User(db.Model):
    __tablename__ = "user"
    
    user_id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey("room.room_id"), nullable=False)
    username = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum(UserRole), nullable=False)
    
    room = db.relationship("Room", back_populates="user")

    student_ticket = db.relationship("Ticket", back_populates="student", 
                                     lazy=True, foreign_keys="Ticket.student_id")
    maintainer_ticket = db.relationship("Ticket", back_populates="maintainer",
                                     lazy=True, foreign_keys="Ticket.maintainer_id")
    
class TicketType(db.Model):
    __tablename__ = "ticket_type"

    ticket_type_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    
    ticket = db.relationship("Ticket", back_populates="ticket_type", lazy=True)
    ticket_type_tools = db.relationship("TicketTypeTool", back_populates="ticket_type", lazy=True)
    
class Tool(db.Model):
    __tablename__ = "tool"

    tool_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    
    ticket_type_tools = db.relationship("TicketTypeTool", back_populates="tool", lazy=True)
    tool_orders = db.relationship("ToolOrder", back_populates="tool", lazy=True)
    
class TicketTypeTool(db.Model):
    __tablename__ = "ticket_type_tool"

    ticket_type_id = db.Column(
        db.Integer, db.ForeignKey("ticket_type.ticket_type_id"), primary_key=True
    )
    tool_id = db.Column(db.Integer, db.ForeignKey("tool.tool_id"), primary_key=True)

    ticket_type = db.relationship("TicketType", back_populates="ticket_type_tools")
    tool = db.relationship("Tool", back_populates="ticket_type_tools")
    
class ToolOrder(db.Model):
    __tablename__ = "tool_order"

    tool_order_id = db.Column(db.Integer, primary_key=True)
    tool_id = db.Column(db.Integer, db.ForeignKey("tool.tool_id"), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    details = db.Column(db.String(255), nullable=True)
    status = db.Column(db.Enum(ToolOrderStatus), nullable=False)

    tool = db.relationship("Tool", back_populates="tool_orders")

class Ticket(db.Model):
    __tablename__ = "ticket"
    __table_args__ = (
        CheckConstraint("priority >= 0 AND priority <= 5", name="check_ticket_priority"),
    )

    ticket_id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey("room.room_id"), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    maintainer_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    ticket_type_id = db.Column(
        db.Integer, db.ForeignKey("ticket_type.ticket_type_id"), nullable=False
    )
    details = db.Column(db.String(255), nullable=False)
    status = db.Column(db.Enum(TicketStatus), nullable=False)
    priority = db.Column(db.Integer, nullable=False)

    room = db.relationship("Room", back_populates="tickets")
    student = db.relationship(
        "User", foreign_keys=[student_id], back_populates="student_tickets"
    )
    maintainer = db.relationship(
        "User", foreign_keys=[maintainer_id], back_populates="maintainer_tickets"
    )
    ticket_type = db.relationship("TicketType", back_populates="tickets")

    student_feedback = db.relationship(
        "StudentFeedback", back_populates="ticket", uselist=False
    )


class StudentFeedback(db.Model):
    __tablename__ = "student_feedback"

    student_feedback_id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(
        db.Integer, db.ForeignKey("ticket.ticket_id"), unique=True, nullable=False
    )
    details = db.Column(db.String(255), nullable=False)

    ticket = db.relationship("Ticket", back_populates="student_feedback")