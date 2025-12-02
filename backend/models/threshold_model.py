# backend/models/threshold_model.py

from sqlalchemy import Column, String, Float
from database import Base  # Make sure Base is imported from db.py

# --- SQLAlchemy ORM model for database ---
class Threshold(Base):
    __tablename__ = "thresholds"

    zone = Column(String, primary_key=True, index=True)
    pm2_5 = Column(Float, default=15.0)   # µg/m³
    pm10 = Column(Float, default=45.0)    # µg/m³
    co = Column(Float, default=4.0)       # ppm

    # Method to return personalized thresholds based on age
    def personalized(self, age: int):
        if age <= 30:
            factor = 1.0
        elif 31 <= age <= 50:
            factor = 0.9
        else:
            factor = 0.8

        return {
            "pm2_5": self.pm2_5 * factor,
            "pm10": self.pm10 * factor,
            "co": self.co * factor
        }
