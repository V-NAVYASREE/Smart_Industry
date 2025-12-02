from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import sqlite3
import os
import csv
import joblib
import smtplib
import requests
import pandas as pd
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ml.fuzzy_logic import fuzzy_risk_level
import requests
from twilio.rest import Client

app = Flask(__name__)
CORS(app)
from dotenv import load_dotenv


load_dotenv()

SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")


# === Path Setup ===

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, 'logs', 'industry_data.db')
DATA_LOG = os.path.join(BASE_DIR, 'logs', 'industry_data.csv')
EXCEL_LOG = os.path.join(BASE_DIR, 'logs', 'industry_data.xlsx')

print(f"\n✅ Using Database File: {DB_FILE}\n")


# === Model Load ===
model = joblib.load(os.path.join(BASE_DIR, 'ml', 'risk_predictor.pkl'))
label_encoder = joblib.load(os.path.join(BASE_DIR, 'ml', 'label_encoder.pkl'))

WS_SERVER_URL = "http://192.168.118.148:8000/broadcast"

os.makedirs(os.path.join(BASE_DIR, 'logs'), exist_ok=True)

# === Database Setup ===
def initialize_database():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    # Create sensor_data table
    c.execute('''CREATE TABLE IF NOT EXISTS sensor_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT,
                    temperature REAL,
                    humidity REAL,
                    voc REAL,
                    co REAL,
                    pm1 REAL,
                    pm25 REAL,
                    pm10 REAL,
                    user_id TEXT
                )''')

    # Create workers table
    c.execute('''CREATE TABLE IF NOT EXISTS workers (
        worker_id TEXT PRIMARY KEY,
        password TEXT,
        name TEXT,
        age INTEGER,
        health_condition TEXT,
        work_environment TEXT,
        email TEXT,
        phone_number TEXT
    )''')

    # Create device_assignments table
    c.execute('''CREATE TABLE IF NOT EXISTS device_assignments (
                    device_id TEXT PRIMARY KEY,
                    assigned_user_id TEXT
                )''')

    conn.commit()
    conn.close()
    print("✅ Database initialized with all tables.")


if not os.path.exists(DATA_LOG):
    with open(DATA_LOG, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['timestamp', 'temperature', 'humidity', 'voc', 'co', 'pm1', 'pm25', 'pm10', 'user_id'])


# === Email Function ===
def send_email_alert(to_email, subject, body):
    try:
        if not to_email:
            print("❌ No email provided, skipping email alert.")
            return

        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.send_message(msg)
        server.quit()

        print("✅ Email sent successfully!")

    except Exception as e:
        print(f"❌ Failed to send email: {e}")


# === SMS Function ===
def send_sms_alert(to_phone, message):
    try:
        if not to_phone:
            print("❌ No phone number provided, skipping SMS alert.")
            return

        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=to_phone
        )
        print("✅ SMS sent successfully!")
    except Exception as e:
        print(f"❌ Failed to send SMS: {e}")


# === Personalized Measures ===
def generate_personalized_measures(worker, flags):
    measures = []

    if any('PM2.5' in flag for flag in flags):
        measures.append('Wear a protective mask immediately.')
    if any('CO' in flag for flag in flags):
        measures.append('Evacuate the area and notify your supervisor.')
    if any('VOC' in flag for flag in flags):
        measures.append('Move to a ventilated area immediately.')

    if worker['age'] >= 60:
        measures.append('Due to your age, leave the hazardous area immediately.')

    if 'asthma' in worker['health_condition'].lower():
        measures.append('Access fresh air immediately due to your asthma.')

    if 'heart' in worker['health_condition'].lower():
        measures.append('Stop work and seek medical attention if needed.')

    return ' '.join(measures) if measures else 'Stay cautious.'


def get_adaptive_thresholds(worker):
    thresholds = {'co': 35, 'pm25': 35, 'voc': 0.5}

    if worker['age'] >= 60:
        thresholds['co'] = 25

    health = worker['health_condition'].lower()
    if 'asthma' in health or 'respiratory' in health:
        thresholds.update({'pm25': 20, 'voc': 0.3})
    if 'heart' in health or 'cardio' in health:
        thresholds['co'] = min(thresholds['co'], 25)
        thresholds['pm25'] = min(thresholds['pm25'], 25)

    env = worker['work_environment'].lower()
    if 'welding' in env or 'chemical' in env:
        thresholds['co'] = min(thresholds['co'], 25)
        thresholds['voc'] = min(thresholds['voc'], 0.3)

    return thresholds


# === API Routes ===

@app.route('/api/latest', methods=['GET'])
def get_latest_data():
    try:
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()

        c.execute('SELECT * FROM sensor_data ORDER BY id DESC LIMIT 1')
        row = c.fetchone()
        conn.close()

        if row:
            return jsonify(dict(row)), 200
        else:
            return jsonify({'error': 'No sensor data found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        worker_id = data.get('worker_id')
        password = data.get('password')
        name = data.get('name')
        age = data.get('age')
        health_condition = data.get('health_condition')
        work_environment = data.get('work_environment')
        email = data.get('email')
        phone_number = data.get('phone_number')

        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()

        c.execute('SELECT * FROM workers WHERE worker_id = ?', (worker_id,))
        existing_user = c.fetchone()

        if existing_user:
            conn.close()
            return jsonify({'message': 'User already exists'}), 400

        c.execute('''INSERT INTO workers (worker_id, password, name, age, health_condition, work_environment, email, phone_number)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                  (worker_id, password, name, age, health_condition, work_environment, email, phone_number))
        conn.commit()
        conn.close()

        return jsonify({'message': 'Registration successful'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# === Updated Login Route with Admin Role ===
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        worker_id = data.get('worker_id')
        password = data.get('password')

        if worker_id == 'admin' and password == 'admin123':
            return jsonify({'message': 'Admin login successful', 'worker_id': 'admin', 'role': 'admin'}), 200

        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()

        c.execute('SELECT * FROM workers WHERE worker_id = ? AND password = ?', (worker_id, password))
        user = c.fetchone()
        conn.close()

        if user:
            return jsonify({'message': 'Login successful', 'worker_id': worker_id, 'role': 'worker'}), 200
        else:
            return jsonify({'message': 'Invalid credentials'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/workers', methods=['GET'])
def get_all_workers():
    try:
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()

        c.execute('SELECT * FROM workers')
        rows = c.fetchall()
        conn.close()

        workers = [dict(row) for row in rows]
        return jsonify(workers), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


        

@app.route('/assign_user', methods=['POST'])
def assign_user():
    try:
        data = request.get_json()
        device_id = data.get('device_id')
        user_id = data.get('user_id')

        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()

        c.execute('''INSERT OR REPLACE INTO device_assignments (device_id, assigned_user_id)
                     VALUES (?, ?)''', (device_id, user_id))
        conn.commit()
        conn.close()

        return jsonify({'message': 'User assigned successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/get_assigned_user/<device_id>', methods=['GET'])
def get_assigned_user(device_id):
    try:
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()

        c.execute('SELECT assigned_user_id FROM device_assignments WHERE device_id = ?', (device_id,))
        row = c.fetchone()
        conn.close()

        if row and row['assigned_user_id']:
            return jsonify({'user_id': row['assigned_user_id']}), 200
        else:
            return jsonify({'user_id': device_id}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/submit_data', methods=['POST'])
def submit_data():
    try:
        print("\n✅ [API HIT] Received data at /submit_data")

        content = request.get_json()
        print(f"✅ Received JSON: {content}")

        token = request.headers.get("X-SENSOR-TOKEN")
        print(f"✅ Received Token: {token}")

        if token != "s3nsor_@uth_2025":
            print("❌ Unauthorized token")
            return jsonify({'status': 'Unauthorized'}), 401

        device_id = content.get('device_id')
        if not device_id:
            print("❌ Device ID missing")
            return jsonify({'error': 'Device ID missing'}), 400

        required_keys = ['temperature', 'humidity', 'voc', 'co', 'pm1', 'pm', 'pm10']
        for key in required_keys:
            if key not in content:
                print(f"❌ Missing key: {key}")
                return jsonify({'error': f'Missing key: {key}'}), 400

        temp = content['temperature']
        hum = content['humidity']
        voc = content['voc']
        co = content['co']
        pm1 = content['pm1']
        pm25 = content['pm']
        pm10 = content['pm10']
        timestamp = content.get('timestamp', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

        print(f"✅ Sensor Values: Temp={temp}, Hum={hum}, VOC={voc}, CO={co}, PM1={pm1}, PM2.5={pm25}, PM10={pm10}")

        with sqlite3.connect(DB_FILE) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()

            c.execute('SELECT assigned_user_id FROM device_assignments WHERE device_id = ?', (device_id,))
            row = c.fetchone()

            user_id = row['assigned_user_id'] if row and row['assigned_user_id'] else device_id
            print(f"✅ Mapped User ID: {user_id}")

            c.execute('SELECT * FROM workers WHERE worker_id=?', (user_id,))
            worker_row = c.fetchone()

            if not worker_row:
                print("⚙️ No worker found, creating auto user...")
                c.execute('''INSERT INTO workers (worker_id, password, name, age, health_condition, work_environment, email, phone_number)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                          (user_id, 'password123', 'Auto Worker', 25, 'Healthy', 'Normal', '', ''))
                conn.commit()
                c.execute('SELECT * FROM workers WHERE worker_id=?', (user_id,))
                worker_row = c.fetchone()

            worker_profile = dict(worker_row)
            print(f"✅ Worker Profile: {worker_profile}")

            c.execute('''INSERT INTO sensor_data (timestamp, temperature, humidity, voc, co, pm1, pm25, pm10, user_id)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                      (timestamp, temp, hum, voc, co, pm1, pm25, pm10, user_id))
            conn.commit()

        print("✅ Data successfully saved to database")

        with open(DATA_LOG, 'a', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([timestamp, temp, hum, voc, co, pm1, pm25, pm10, user_id])

        print("✅ Data logged to CSV")
        

        thresholds = get_adaptive_thresholds(worker_profile)
        flags = []

        if pm25 > thresholds['pm25']:
            flags.append(f"PM2.5 {pm25} > {thresholds['pm25']}")
        if co > thresholds['co']:
            flags.append(f"CO {co} > {thresholds['co']}")
        if voc > thresholds['voc']:
            flags.append(f"VOC {voc} > {thresholds['voc']}")

        features = [[temp, hum, voc, co, pm1, pm25, pm10]]
        predicted_class = model.predict(features)[0]
        predicted_label = label_encoder.inverse_transform([predicted_class])[0]

        fuzzy_risk = fuzzy_risk_level(pm25, co, voc)

        risk_label = "Unsafe" if predicted_label in ['High', 'Critical'] or fuzzy_risk == 'High' else "Safe"

        alert_message = f"Alert for {user_id}: Risk - {risk_label}, Model: {predicted_label}, Fuzzy: {fuzzy_risk}, Issues: {', '.join(flags)}"
        print(f"✅ Final Alert: {alert_message}")

        # === Send Live Data to WebSocket Server ===
        payload = {
            "user_id": user_id,
            "user_name": worker_profile['name'],
            "risk_level": risk_label,
            "model_label": predicted_label,
            "fuzzy_risk": fuzzy_risk,
            "alert": alert_message,
            "thresholds": thresholds,
            "flags": flags,
            "sensor_data": content,
            }
        try:
            requests.post(WS_SERVER_URL, json={**payload, "target_role": "worker"})
            requests.post(WS_SERVER_URL, json={**payload, "target_role": "admin"})
            print("✅ Data sent to both Worker and Admin WebSocket channels")
        except Exception as e:
            print(f"❌ Failed to send WebSocket data: {e}")

        if risk_label == "Unsafe":
            subject = f"⚠️ Safety Alert for {user_id}"
            body = f"""
            Dear {worker_profile['name']},

            🚨 Safety Alert Detected 🚨

            Risk Level: {risk_label}
            Model Prediction: {predicted_label}
            Fuzzy Risk: {fuzzy_risk}
            Detected Issues: {', '.join(flags) if flags else 'No issues detected'}
            Timestamp: {timestamp}

            Please follow the personalized safety measures immediately:
            - {generate_personalized_measures(worker_profile, flags)}

            Stay Safe.

            Regards,
            Industry Safety System
            """

            send_email_alert(worker_profile['email'], subject, body)
            send_sms_alert(worker_profile['phone_number'], subject)

        return jsonify({
            'status': 'success',
            'final_risk': risk_label,
            'model_prediction': predicted_label,
            'fuzzy_risk': fuzzy_risk,
            'flags': flags,
            'message': alert_message
        }), 200

    except Exception as e:
        print(f"❌ Exception in submit_data: {str(e)}")
        return jsonify({'error': str(e)}), 500

    
@app.route('/worker/<worker_id>', methods=['GET'])
def get_worker(worker_id):
    try:
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()

        c.execute('SELECT * FROM workers WHERE worker_id = ?', (worker_id,))
        row = c.fetchone()
        conn.close()

        if row:
            return jsonify(dict(row)), 200
        else:
            return jsonify({'error': 'User not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/sensor_data', methods=['GET'])
def get_all_sensor_data():
    try:
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()

        c.execute('SELECT * FROM sensor_data ORDER BY id DESC LIMIT 100')  # Latest 100 entries
        rows = c.fetchall()
        conn.close()

        sensor_data = [dict(row) for row in rows]
        return jsonify(sensor_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
if __name__ == '__main__':
    initialize_database()  # Must be called BEFORE starting the server
    app.run(debug=True, port=5001, host='0.0.0.0')

