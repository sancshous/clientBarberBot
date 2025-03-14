# app.py

from flask import Flask, request, jsonify, render_template
import sqlite3
from datetime import datetime, timedelta

app = Flask(__name__, static_folder='static')

@app.route('/')
def home():
    return render_template('index.html')


if __name__ == "__main__":
    app.run(debug=True)
