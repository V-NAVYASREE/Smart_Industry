from sqlalchemy import Column, Integer, String, DateTime, Text
from database import Base
from datetime import datetime

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(String)
    zone = Column(String)
    message = Column(Text)
    level = Column(String, default="High")
    timestamp = Column(DateTime, default=datetime.now)
