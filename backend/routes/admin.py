from flask import Blueprint, request, jsonify
from backend.database import db_session
from backend.models.user_model import User, RoleEnum
from backend.models.zone_model import Zone
from backend.models.threshold_model import Threshold

admin_bp = Blueprint('admin_routes', __name__)

# Get all pending workers (not approved yet)
@admin_bp.route('/pending-workers', methods=['GET'])
def get_pending_workers():
    pending = User.query.filter_by(role=RoleEnum.worker, approved=False).all()
    return jsonify([{
        "id": worker.id,
        "name": worker.name,
        "email": worker.email,
        "zone_assigned": worker.zone_assigned
    } for worker in pending])

# Approve a worker
@admin_bp.route('/approve-worker/<int:worker_id>', methods=['POST'])
def approve_worker(worker_id):
    worker = User.query.filter_by(id=worker_id, role=RoleEnum.worker).first()
    if not worker:
        return jsonify({"error": "Worker not found"}), 404
    worker.approved = True
    db_session.commit()
    return jsonify({"message": "Worker approved"})

# Add a new zone
@admin_bp.route('/add-zone', methods=['POST'])
def add_zone():
    data = request.get_json()
    name = data.get("name")
    description = data.get("description", "")

    if Zone.query.filter_by(name=name).first():
        return jsonify({"error": "Zone already exists"}), 400

    new_zone = Zone(name=name, description=description)
    db_session.add(new_zone)
    db_session.commit()
    return jsonify({"message": "Zone added successfully"})

# Get all zones
@admin_bp.route('/zones', methods=['GET'])
def get_zones():
    zones = Zone.query.all()
    return jsonify([
        {"id": z.id, "name": z.name, "description": z.description}
        for z in zones
    ])

# Set thresholds for a zone
@admin_bp.route('/set-threshold', methods=['POST'])
def set_threshold():
    data = request.get_json()
    zone_name = data.get("zone")
    temperature = data.get("temperature")
    humidity = data.get("humidity")
    pm25 = data.get("pm25")
    co = data.get("co")

    zone = Zone.query.filter_by(name=zone_name).first()
    if not zone:
        return jsonify({"error": "Zone not found"}), 404

    threshold = Threshold.query.filter_by(zone_id=zone.id).first()
    if threshold:
        threshold.temperature = temperature
        threshold.humidity = humidity
        threshold.pm25 = pm25
        threshold.co = co
    else:
        threshold = Threshold(
            zone_id=zone.id,
            temperature=temperature,
            humidity=humidity,
            pm25=pm25,
            co=co
        )
        db_session.add(threshold)

    db_session.commit()
    return jsonify({"message": "Threshold set successfully"})
