# create_database.py

import sqlite3

def create_db():
    conn = sqlite3.connect('barbershop.db')
    cursor = conn.cursor()

    cursor.execute('''CREATE TABLE IF NOT EXISTS masters (
                        id INTEGER PRIMARY KEY,
                        name TEXT NOT NULL)''')

    cursor.execute('''CREATE TABLE IF NOT EXISTS services (
                        id INTEGER PRIMARY KEY,
                        name TEXT NOT NULL,
                        price REAL NOT NULL,
                        duration INTEGER NOT NULL)''')  # Длительность услуги в минутах

    cursor.execute('''CREATE TABLE IF NOT EXISTS appointments (
                        id INTEGER PRIMARY KEY,
                        master_id INTEGER NOT NULL,
                        service_id INTEGER NOT NULL,
                        date TEXT NOT NULL,
                        time TEXT NOT NULL,
                        client_name TEXT NOT NULL,
                        client_phone TEXT NOT NULL,
                        FOREIGN KEY (master_id) REFERENCES masters(id),
                        FOREIGN KEY (service_id) REFERENCES services(id))''')

    # Добавление тестовых данных
    cursor.executemany('''INSERT INTO masters (id, name) VALUES (?, ?)''', 
                       [(1, 'Иван'), (2, 'Петр'), (3, 'Сергей')])

    cursor.executemany('''INSERT INTO services (id, name, price, duration) VALUES (?, ?, ?, ?)''', 
                       [(1, 'Стрижка', 500, 60), (2, 'Бритье', 300, 30), (3, 'Укладка', 400, 45)])

    conn.commit()
    conn.close()

if __name__ == "__main__":
    create_db()
