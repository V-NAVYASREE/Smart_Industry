# backend/db.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from models.alert_model import Alert  # Import your existing model
# Later you’ll import Worker, Zone, etc., here too

# SQLite DB path
DATABASE_URL = "sqlite:///./logs/industry_data.db"

# Create the logs directory if it doesn't exist
import os
os.makedirs("logs", exist_ok=True)

# SQLAlchemy engine and session
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

# Base class for models
Base = declarative_base()

# Initialize DB with all models
def init_db():
    import models.alert_model  # Ensure model is loaded
    # Import other models here (worker_model, zone_model, etc.)
    Base.metadata.create_all(bind=engine)
