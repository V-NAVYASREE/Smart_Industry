from flask import Blueprint, request, jsonify
from models.alert_model import Alert
from models.user_model import User
from database import db_session
from jose import jwt
import os

alerts_bp = Blueprint('alerts', __name__)

SECRET_KEY = os.getenv("SECRET_KEY", "mysecretkey")
ALGORITHM = "HS256"

def get_user_from_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user = db_session.query(User).filter_by(id=payload["user_id"]).first()
        return user
    except Exception as e:
        print("Token error:", e)
        return None

@alerts_bp.route("/my-alerts", methods=["GET"])
def get_my_alerts():
    token = request.args.get("token")
    if not token:
        return jsonify({"error": "Token required"}), 400

    user = get_user_from_token(token)
    if not user:
        return jsonify({"error": "Invalid token"}), 403

    alerts = db_session.query(Alert)\
        .filter_by(zone=user.zone_assigned)\
        .order_by(Alert.timestamp.desc())\
        .limit(10)\
        .all()

    result = [
        {
            "id": alert.id,
            "message": alert.message,
            "severity": alert.severity,
            "timestamp": alert.timestamp.isoformat(),
            "zone": alert.zone
        }
        for alert in alerts
    ]

    return jsonify(result)
