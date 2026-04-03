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
    
