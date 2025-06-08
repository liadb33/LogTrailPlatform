from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

def create_app():
    load_dotenv()

    app = Flask(__name__)
    CORS(app)

    # Register routes (we'll define them in a moment)
    from .routes.log_routes import log_bp
    from .routes.settings_routes import settings_bp
    
    app.register_blueprint(log_bp, url_prefix="/logs")
    app.register_blueprint(settings_bp, url_prefix="/settings")

    return app
