from flask import Flask, jsonify
from flasgger import Swagger

app = Flask(__name__)

swagger = Swagger(app)

@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "Hello from Flask backend!"})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
