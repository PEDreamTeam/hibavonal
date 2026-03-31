from flask import Flask, jsonify, request
from flasgger import Swagger
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

swagger = Swagger(app)

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

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
