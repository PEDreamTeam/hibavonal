from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# Shared extension instances for the application
# This avoids circular imports between app.py and models.py

db = SQLAlchemy()
migrate = Migrate()
