import sqlite3

# Sample dummy worker data
name = "Sudhiksha D"
department = "Production"
shift = "Day"
worker_id = "sudhi123"
dob = "2004-02-19"  # YYYY-MM-DD format

# Connect to the database
conn = sqlite3.connect("smart_industry.db")
cursor = conn.cursor()

# Create workers table with dob added
cursor.execute("""
CREATE TABLE IF NOT EXISTS workers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    department TEXT,
    shift TEXT,
    worker_id TEXT UNIQUE NOT NULL,
    dob TEXT
)
""")

# Create device_assignments table
cursor.execute("""
CREATE TABLE IF NOT EXISTS device_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,
    worker_id TEXT NOT NULL,
    FOREIGN KEY (worker_id) REFERENCES workers(worker_id)
)
""")

# Create sensor_data table
cursor.execute("""
CREATE TABLE IF NOT EXISTS sensor_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT,
    temperature REAL,
    humidity REAL,
    voc REAL,
    co REAL,
    pm1 REAL,
    pm25 REAL,
    pm10 REAL,
    timestamp TEXT,
    worker_id TEXT,
    FOREIGN KEY (worker_id) REFERENCES workers(worker_id)
)
""")

# Insert worker data with dob
cursor.execute("""
    INSERT OR IGNORE INTO workers (name, department, shift, worker_id, dob)
    VALUES (?, ?, ?, ?, ?)
""", (name, department, shift, worker_id, dob))
cursor.execute("ALTER TABLE workers ADD COLUMN health_condition TEXT;")
conn.commit()

# Insert device assignment
cursor.execute("""
INSERT OR IGNORE INTO device_assignments (device_id, worker_id)
VALUES ('1C:69:20:A5:07:24', 'sudhi123')
""")

# Save and close
conn.commit()
conn.close()

print("✅ Database and tables created successfully.")
