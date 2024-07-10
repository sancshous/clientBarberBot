# app.py

from flask import Flask, request, jsonify, render_template
import sqlite3
from datetime import datetime, timedelta

app = Flask(__name__, static_folder='static')

@app.route('/')
def home():
    return render_template('index.html')

def query_db(query, args=(), one=False):
    conn = sqlite3.connect('barbershop.db')
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute(query, args)
    rv = cur.fetchall()
    conn.close()
    return (rv[0] if rv else None) if one else rv

@app.route('/masters', methods=['GET'])
def get_masters():
    masters = query_db('SELECT * FROM masters')
    return jsonify([dict(master) for master in masters])

@app.route('/services', methods=['GET'])
def get_services():
    services = query_db('SELECT * FROM services')
    return jsonify([dict(service) for service in services])
@app.route('/available-dates', methods=['GET'])
def get_available_dates():
    master_id = request.args.get('master_id')

    # Вернем все возможные даты для записи, без учета существующих записей
    today = datetime.today()
    available_dates = [(today + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(30)]
    
    return jsonify([{"date": d} for d in available_dates])

@app.route('/available-times', methods=['GET'])
def get_available_times():
    master_id = request.args.get('master_id')
    service_id = request.args.get('service_id')
    date = request.args.get('date')

    conn = sqlite3.connect('barbershop.db')
    cur = conn.cursor()
    cur.execute('SELECT duration FROM services WHERE id = ?', (service_id,))
    duration = cur.fetchone()[0]
    cur.execute('SELECT time, service_id FROM appointments WHERE master_id = ? AND date = ?', (master_id, date))
    appointments = cur.fetchall()
    appointments_times = [(datetime.strptime(a[0], "%H:%M").time(), a[1]) for a in appointments]
    conn.close()

    available_times = generate_available_times(appointments_times, duration)
    
    return jsonify([{"time": t.strftime("%H:%M")} for t in available_times])

def generate_available_times(appointments_times, duration):
    start_time = datetime.strptime("10:00", "%H:%M").time()
    end_time = datetime.strptime("20:00", "%H:%M").time()
    current_time = start_time

    available_times = []

    while (datetime.combine(datetime.today(), current_time) + timedelta(minutes=duration)).time() <= end_time:
        end_appointment_time = (datetime.combine(datetime.today(), current_time) + timedelta(minutes=duration)).time()
        if not any((datetime.combine(datetime.today(), at) <= datetime.combine(datetime.today(), current_time) < datetime.combine(datetime.today(), at) + timedelta(minutes=get_service_duration(sid))) or
                   (datetime.combine(datetime.today(), at) < datetime.combine(datetime.today(), end_appointment_time) <= datetime.combine(datetime.today(), at) + timedelta(minutes=get_service_duration(sid)))
                   for at, sid in appointments_times):
            available_times.append(current_time)
        current_time = (datetime.combine(datetime.today(), current_time) + timedelta(minutes=30)).time()

    return available_times

def get_service_duration(service_id):
    conn = sqlite3.connect('barbershop.db')
    cur = conn.cursor()
    cur.execute('SELECT duration FROM services WHERE id = ?', (service_id,))
    duration = cur.fetchone()[0]
    conn.close()
    return duration

@app.route('/book', methods=['POST'])
def book_appointment():
    data = request.get_json()
    master_id = data['master_id']
    service_id = data['service_id']
    date = data['date']
    time = data['time']
    client_name = data['client_name']
    client_phone = data['client_phone']

    conn = sqlite3.connect('barbershop.db')
    cur = conn.cursor()
    cur.execute('''INSERT INTO appointments (master_id, service_id, date, time, client_name, client_phone)
                   VALUES (?, ?, ?, ?, ?, ?)''',
                (master_id, service_id, date, time, client_name, client_phone))
    conn.commit()
    conn.close()

    return jsonify({"message": "Appointment booked successfully"}), 200

if __name__ == "__main__":
    app.run(debug=True)
