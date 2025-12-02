from flask import Blueprint, request, jsonify
from flask_socketio import emit
from datetime import datetime
from models.alert_model import Alert
from models.worker_model import worker_db
from models.threshold_model import Threshold
from controllers.threshold import threshold_db
from database import alert_db
import json

alerts_bp = Blueprint('alerts', __name__)
connected_clients = {}

# WebSocket: Flask-SocketIO version
def register_socketio_events(socketio):
    @socketio.on('connect')
    def handle_connect():
        worker_id = request.args.get('worker_id')
        if worker_id:
            connected_clients[worker_id] = request.sid
            print(f"[Socket] Worker {worker_id} connected: {request.sid}")

    @socketio.on('disconnect')
    def handle_disconnect():
        disconnected = [k for k, v in connected_clients.items() if v == request.sid]
        for k in disconnected:
            connected_clients.pop(k, None)
            print(f"[Socket] Worker {k} disconnected")

# HTTP POST Alert check
@alerts_bp.route('/alert/check', methods=['POST'])
def check_alert():
    data = request.get_json()
    worker_id = data.get("worker_id")
    zone = data.get("zone")

    if worker_id not in worker_db:
        return jsonify({"message": "Worker not found"}), 404

    if zone not in threshold_db:
        return jsonify({"message": "Zone threshold not set"}), 404

    worker = worker_db[worker_id]
    age = worker.age
    base_threshold: Threshold = threshold_db[zone]
    personalized_limits = base_threshold.personalized(age)

    exceeded = {}
    for param in ["pm2_5", "pm10", "co"]:
        value = data.get(param)
        if value is not None and value > personalized_limits[param]:
            exceeded[param] = value

    if exceeded:
        alert = Alert(
            worker_id=worker_id,
            timestamp=datetime.now(),
            zone=zone,
            sensor_values=data,
            exceeded=exceeded
        )
        alert_db.append(alert)

        # Notify via WebSocket
        from app import socketio  # safe import
        if worker_id in connected_clients:
            try:
                sid = connected_clients[worker_id]
                msg = {
                    "alert": f"Health Alert! Unsafe levels: {', '.join(exceeded.keys())}",
                    "values": exceeded,
                    "zone": zone,
                    "timestamp": str(alert.timestamp)
                }
                socketio.emit('alert', msg, to=sid)
            except Exception as e:
                print(f"Socket send error: {e}")

        return jsonify({"status": "Alert Triggered", "exceeded": exceeded})

    return jsonify({"status": "Safe", "message": "All values under threshold"})
