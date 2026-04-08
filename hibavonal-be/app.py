from flask import Flask, jsonify
from flasgger import Swagger
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
import os

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL",
    "sqlite:///hibavonal.db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")

db = SQLAlchemy(app)
migrate = Migrate(app, db)

CORS(app, origins=["http://localhost:5173"])

import models

swagger = Swagger(app)

from routes.auth import auth_bp
app.register_blueprint(auth_bp, url_prefix="/api/auth")

@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "Hello from Flask backend!"})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
