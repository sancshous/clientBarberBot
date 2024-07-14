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

@app.route('/master_difficult/<pos_id>', methods=['GET'])
def get_masters_difficult(pos_id):
    conn = sqlite3.connect('barbershop.db')
    cur = conn.cursor()
    cur.execute('SELECT id, name, difficult FROM services where difficult >= ?', (pos_id))
    masters_difficult = [{'id': row[0], 'name': row[1], 'difficult': row[2]} for row in cur.fetchall()]

    return jsonify(masters_difficult)

@app.route('/closed-times/<date>', methods=['GET'])
def get_closed_times(date):
    master_id = request.args.get('master_id')

    conn = sqlite3.connect('barbershop.db')
    cur = conn.cursor()
    cur.execute("select id, duration from services")
    duration_services = [{'id': row[0], 'duration': row[1]} for row in cur.fetchall()]
    cur.execute('SELECT time, services FROM appointments WHERE master_id = ? AND date = ?', (master_id, date))
    times = cur.fetchall()
    closed_times = []
    for row in times:
        totalDuration = 0
        service_arr = row[1].split(',')
        for service in service_arr:
            for duration in duration_services:
                if duration["id"] == int(service):
                    totalDuration += duration["duration"]
        closed_times.append({'start' : row[0], 'end' : row[0] + totalDuration / 60}) 
    conn.close()
    
    return jsonify(closed_times)

@app.route('/book', methods=['POST'])
def book_appointment():
    cart = request.get_json()
    services = ''
    for service in cart["service"]:
        services += str(service["id"]) + ','
    services = services.rstrip(',')
    
    conn = sqlite3.connect('barbershop.db')
    cur = conn.cursor()
    query = f'''INSERT INTO appointments (master_id, services, date, time, user_name, user_phone, user_comment) 
        VALUES ({cart["master"]["id"]}, '{services}', '{cart["date"]}', {cart["time"]}, '{cart["user_name"]}', '{cart["user_phone"]}', '{cart["user_comment"]}')'''
    cur.execute(query)
    conn.commit()
    conn.close()

    return jsonify({"message": "Appointment booked successfully"}), 200

if __name__ == "__main__":
    app.run(debug=True)
