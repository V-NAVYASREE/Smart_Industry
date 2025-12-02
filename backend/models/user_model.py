# backend/models/user_model.py

from sqlalchemy import Column, Integer, String, Boolean, Enum
from ..database import Base
import enum

# Enum for role
class RoleEnum(str, enum.Enum):
    admin = "admin"
    worker = "worker"

# SQLAlchemy ORM model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.worker)
    zone_assigned = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    personalized_alerts = Column(Boolean, default=False)
    approved = Column(Boolean, default=False)
