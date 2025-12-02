# backend/models/worker_model.py

from sqlalchemy import Column, Integer, String, Boolean
from backend.database import Base

class Worker(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(String, unique=True, index=True, nullable=False)  # Unique Worker Identifier
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)  # Status: Active or Inactive
