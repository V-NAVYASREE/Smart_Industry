# backend/routes/alert_routes.py

from flask import Blueprint, request, jsonify
from flask_socketio import emit
from datetime import datetime
from models.alert_model import Alert
from database import db

alert_bp = Blueprint("alerts", __name__)
socketio = None  # will be set externally

@alert_bp.route("/send-alert", methods=["POST"])
def send_alert():
    data = request.json
    zone = data.get("zone")
    message = data.get("message")
    level = data.get("level")

    if not zone or not message or not level:
        return jsonify({"error": "Missing required fields"}), 400

    alert = Alert(
        zone=zone,
        message=message,
        level=level,
        timestamp=datetime.now()
    )
    db.session.add(alert)
    db.session.commit()

    payload = {
        "zone": alert.zone,
        "message": alert.message,
        "level": alert.level,
        "timestamp": str(alert.timestamp)
    }

    # Emit to all WebSocket clients
    if socketio:
        socketio.emit("new_alert", payload, broadcast=True)

    return jsonify({"message": "Alert broadcasted", "data": payload})
