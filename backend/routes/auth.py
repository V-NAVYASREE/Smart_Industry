# backend/routes/auth_routes.py

from flask import Blueprint, request, jsonify
from models.user_model import User
from passlib.hash import bcrypt
from database import db
from jose import jwt
import os

auth_bp = Blueprint("auth", __name__)

SECRET_KEY = os.getenv("SECRET_KEY", "mysecretkey")
ALGORITHM = "HS256"

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")

    if db.session.query(User).filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400

    hashed_pw = bcrypt.hash(data["password"])
    new_user = User(
        name=data["name"],
        email=email,
        password=hashed_pw,
        role=data["role"],
        zone_assigned=data.get("zone_assigned"),
        age=data.get("age"),
        personalized_alerts=data.get("personalized_alerts", False),
        approved=(data["role"] == "worker")
    )
    db.session.add(new_user)
    db.session.commit()
    db.session.refresh(new_user)
    return jsonify({"message": "User registered successfully", "id": new_user.id})

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = db.session.query(User).filter_by(email=email).first()
    if not user or not bcrypt.verify(password, user.password):
        return jsonify({"error": "Invalid credentials"}), 401

    if not user.approved:
        return jsonify({"error": "User not approved yet"}), 403

    token_data = {
        "user_id": user.id,
        "role": user.role,
        "email": user.email
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    return jsonify({"access_token": token, "role": user.role})
