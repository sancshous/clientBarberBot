# create_database.py

import sqlite3

def create_db():
    conn = sqlite3.connect('barbershop.db')
    cursor = conn.cursor()

    cursor.execute('''CREATE TABLE IF NOT EXISTS masters (
                        id INTEGER PRIMARY KEY,
                        name TEXT NOT NULL,
                        pos_id INTEGER NOT NULL,
                        pos_name TEXT NOT NULL)''')

    cursor.execute('''CREATE TABLE IF NOT EXISTS services (
                        id INTEGER PRIMARY KEY,
                        name TEXT NOT NULL,
                        price REAL NOT NULL,
                        duration INTEGER NOT NULL,
                        difficult INTEGER NOT NULL)''')  # Длительность услуги в минутах

    cursor.execute('''CREATE TABLE IF NOT EXISTS appointments (
                        id INTEGER PRIMARY KEY,
                        master_id INTEGER NOT NULL,
                        services TEXT NOT NULL,
                        date TEXT NOT NULL,
                        time REAL NOT NULL,
                        client_name TEXT NOT NULL,
                        client_phone TEXT NOT NULL,
                        FOREIGN KEY (master_id) REFERENCES masters(id))''')

    # Добавление тестовых данных
    cursor.executemany('''INSERT INTO masters (id, name, pos_id, pos_name) VALUES (?, ?, ?, ?)''', 
                       [(1, 'Иван', 1, 'Топ-барбер'), (2, 'Петр', 2, 'Барбер'), (3, 'Сергей', 3, 'Стажер')])

    cursor.executemany('''INSERT INTO services (id, name, price, duration, difficult) VALUES (?, ?, ?, ?, ?)''', 
                       [(1, 'Стрижка', 500, 60, 1), (2, 'Бритье', 300, 30, 2), (3, 'Укладка', 400, 45, 3)])
    
    cursor.executemany('''INSERT INTO appointments (id, master_id, services, date, time, client_name, client_phone) VALUES (?, ?, ?, ?, ?, ?, ?)''', 
                       [(1, 1, '1,2', '2024-07-13', 13, 'Александр', '89226838883'), 
                        (2, 2, '2', '2024-07-13', 13.5, 'Александр', '89226838883')])

    conn.commit()
    conn.close()

if __name__ == "__main__":
    create_db()
