# backend/models/zone_model.py

from sqlalchemy import Column, Integer, String
from backend.database import Base  # Adjust this import based on your folder structure

class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
