from flask import Flask, jsonify, request
from flasgger import Swagger
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import os

app = Flask(__name__)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hibavonal.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# JWT configuration
app.config['JWT_SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)

db = SQLAlchemy(app)
jwt = JWTManager(app)

CORS(app)
swagger = Swagger(app)

# ==================== Models ====================

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student')  # student, maintenance, admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    tool_orders = db.relationship('ToolOrder', backref='creator', foreign_keys='ToolOrder.created_by_id')
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }

class Tool(db.Model):
    __tablename__ = 'tools'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(80))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'created_at': self.created_at.isoformat()
        }

class ToolOrder(db.Model):
    __tablename__ = 'tool_orders'
    
    id = db.Column(db.Integer, primary_key=True)
    tool_name = db.Column(db.String(120), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending')  # pending, approved, rejected, completed
    quantity = db.Column(db.Integer, default=1)
    reason = db.Column(db.Text)
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        creator = User.query.get(self.created_by_id)
        return {
            'id': self.id,
            'tool_name': self.tool_name,
            'status': self.status,
            'quantity': self.quantity,
            'reason': self.reason,
            'created_by': creator.username if creator else 'Unknown',
            'created_by_id': self.created_by_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# ==================== Authentication Routes ====================

@app.route("/auth/register", methods=["POST"])
def register():
    """
    Felhasználó regisztrációja
    ---
    parameters:
      - name: body
        in: body
        required: true
        schema:
          properties:
            username:
              type: string
            password:
              type: string
            role:
              type: string
              enum: ['student', 'maintenance', 'admin']
    responses:
      201:
        description: Felhasználó sikeresen regisztrálva
      400:
        description: Hiányzó adatok vagy már létezik
      500:
        description: Szerverhiba
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({"error": "Hiányzó adatok"}), 400
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({"error": "A felhasználó már létezik"}), 400
        
        user = User(
            username=data['username'],
            password=data['password'],  # In production, hash this!
            role=data.get('role', 'student')
        )
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            "message": "Felhasználó sikeresen regisztrálva",
            "user": user.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/auth/login", methods=["POST"])
def login():
    """
    Felhasználó bejelentkezése
    ---
    parameters:
      - name: body
        in: body
        required: true
        schema:
          properties:
            username:
              type: string
            password:
              type: string
    responses:
      200:
        description: Sikeres bejelentkezés, access token visszaadva
      401:
        description: Hibás felhasználónév vagy jelszó
      400:
        description: Hiányzó adatok
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({"error": "Hiányzó adatok"}), 400
        
        user = User.query.filter_by(username=data['username']).first()
        
        if not user or user.password != data['password']:  # In production, compare hashes!
            return jsonify({"error": "Hibás felhasználónév vagy jelszó"}), 401
        
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            "message": "Sikeres bejelentkezés",
            "access_token": access_token,
            "user": user.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/auth/me", methods=["GET"])
@jwt_required()
def get_current_user():
    """
    Az aktuális felhasználó adatai
    ---
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
    responses:
      200:
        description: A felhasználó információja
      401:
        description: Nincs bejelentkezve
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "Felhasználó nem található"}), 404
    
    return jsonify(user.to_dict()), 200

# ==================== Tool Order Routes ====================

@app.route("/tools/orders", methods=["GET"])
@jwt_required()
def get_tool_orders():
    """
    Szerszám megrendelések listája (szerepkör alapú szűréssel)
    ---
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
    responses:
      200:
        description: Megrendelések listája
      403:
        description: Nincs jogosultságod
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"error": "Felhasználó nem található"}), 404
        
        # Admin látja az összes megrendelést
        if user.role == 'admin':
            orders = ToolOrder.query.all()
        # Maintenance csak a saját megrendeléseit látja
        elif user.role == 'maintenance':
            orders = ToolOrder.query.filter_by(created_by_id=current_user_id).all()
        # Student nem láthatja
        else:
            return jsonify({"error": "Nincs jogosultságod ehhez a funkcióhoz"}), 403
        
        return jsonify({
            "orders": [order.to_dict() for order in orders]
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/tools/orders", methods=["POST"])
@jwt_required()
def create_tool_order():
    """
    Új szerszám megrendelés létrehozása
    ---
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
      - name: body
        in: body
        required: true
        schema:
          properties:
            tool_name:
              type: string
            quantity:
              type: integer
            reason:
              type: string
    responses:
      201:
        description: Megrendelés sikeresen létrehozva
      400:
        description: Hiányzó adatok
      403:
        description: Nincs jogosultságod
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"error": "Felhasználó nem található"}), 404
        
        # Csak maintenance és admin hozhat létre megrendelést
        if user.role not in ['maintenance', 'admin']:
            return jsonify({"error": "Nincs jogosultságod ehhez a funkcióhoz"}), 403
        
        data = request.get_json()
        
        if not data or not data.get('tool_name'):
            return jsonify({"error": "A szerszám neve kötelező"}), 400
        
        order = ToolOrder(
            tool_name=data['tool_name'],
            quantity=data.get('quantity', 1),
            reason=data.get('reason', ''),
            created_by_id=current_user_id,
            status='pending'
        )
        
        db.session.add(order)
        db.session.commit()
        
        return jsonify({
            "message": "Megrendelés sikeresen létrehozva",
            "order": order.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/tools/orders/<int:order_id>", methods=["PATCH"])
@jwt_required()
def update_tool_order(order_id):
    """
    Szerszám megrendelés frissítése (csak admin)
    ---
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
      - name: order_id
        in: path
        required: true
        type: integer
      - name: body
        in: body
        required: true
        schema:
          properties:
            status:
              type: string
              enum: ['pending', 'approved', 'rejected', 'completed']
    responses:
      200:
        description: Megrendelés frissítve
      403:
        description: Nincs jogosultságod
      404:
        description: Megrendelés nem található
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"error": "Felhasználó nem található"}), 404
        
        # Csak admin módosíthat
        if user.role != 'admin':
            return jsonify({"error": "Nincs jogosultságod ehhez a funkcióhoz"}), 403
        
        order = ToolOrder.query.get(order_id)
        
        if not order:
            return jsonify({"error": "Megrendelés nem található"}), 404
        
        data = request.get_json()
        
        if 'status' in data:
            order.status = data['status']
        
        order.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            "message": "Megrendelés frissítve",
            "order": order.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ==================== Existing Routes ====================

@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "Hello from Flask backend!"})

@app.route("/tickets/create", methods=["POST"])
def create_ticket():
    """
    Új hibajegy létrehozása
    ---
    parameters:
      - name: body
        in: body
        required: true
        schema:
          id: Ticket
          required:
            - title
            - description
          properties:
            title:
              type: string
            description:
              type: string
    responses:
      201:
        description: Ticket sikeresen létrehozva
      400:
        description: Hiányzó adatok
      403:
        description: Nincs jogosultságod
      500:
        description: Szerverhiba
    """
    try:
        user_role = "student" 

        if user_role not in ["student", "admin"]:
            return jsonify({"error": "Hozzáférés megtagadva"}), 403

        data = request.get_json()
        
        if not data or "title" not in data or "description" not in data:
            return jsonify({"error": "Hiányzó adatok"}), 400

        print(f"Mentés: {data}")
        return jsonify({"message": "Ticket sikeresen létrehozva"}), 201

    except Exception as e:
        return jsonify({"error": "Szerverhiba"}), 500

# ==================== Create Database ====================

def create_demo_users():
    """Demo felhasználókat hoz létre teszteléshez"""
    if not User.query.filter_by(username='student').first():
        user = User(username='student', password='pass123', role='student')
        db.session.add(user)
    
    if not User.query.filter_by(username='maintenance').first():
        user = User(username='maintenance', password='pass123', role='maintenance')
        db.session.add(user)
        db.session.commit()
        
        # Create some demo tool orders for testing
        order = ToolOrder(
            tool_name='Fúró',
            quantity=2,
            reason='Végzés előkészítéséhez szükséges',
            created_by_id=user.id,
            status='pending'
        )
        db.session.add(order)
    
    if not User.query.filter_by(username='admin').first():
        user = User(username='admin', password='pass123', role='admin')
        db.session.add(user)
    
    db.session.commit()

@app.before_request
def create_tables():
    """Adattáblákat létrehozza, ha nem léteznek"""
    if not hasattr(create_tables, 'initialized'):
        db.create_all()
        create_demo_users()
        create_tables.initialized = True

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

