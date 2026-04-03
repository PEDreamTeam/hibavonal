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
    
    room_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    notes = db.Column(db.String(255), nullable=True)
    
    users = db.relationship("User", back_populates="room", lazy=True)
    tickets = db.relationship("Ticket", back_populates="room", lazy=True)
    
