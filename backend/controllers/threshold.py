from flask import Blueprint, request, jsonify

threshold_bp = Blueprint('threshold_bp', __name__)
threshold_db = {}  # Simulated in-memory DB

@threshold_bp.route("/threshold/add", methods=["POST"])
def add_threshold():
    threshold = request.get_json()
    zone = threshold.get("zone")
    if not zone:
        return jsonify({"error": "Zone is required."}), 400
    if zone in threshold_db:
        return jsonify({"error": "Threshold already set for this zone."}), 400
    threshold_db[zone] = threshold
    return jsonify({"message": "Threshold added successfully."})

@threshold_bp.route("/threshold/<zone>", methods=["GET"])
def get_threshold(zone):
    if zone not in threshold_db:
        return jsonify({"error": "Threshold not found for this zone."}), 404
    return jsonify(threshold_db[zone])

@threshold_bp.route("/threshold/update/<zone>", methods=["PUT"])
def update_threshold(zone):
    if zone not in threshold_db:
        return jsonify({"error": "Zone not found."}), 404
    updated = request.get_json()
    threshold_db[zone] = updated
    return jsonify({"message": "Threshold updated successfully."})
