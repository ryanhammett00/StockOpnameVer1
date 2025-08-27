from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

def init_db():
    conn = sqlite3.connect('stock.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS stock
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT, system INTEGER, actual INTEGER, diff INTEGER)''')
    conn.commit()
    conn.close()

@app.route('/api/stock', methods=['GET'])
def get_stock():
    conn = sqlite3.connect('stock.db')
    c = conn.cursor()
    c.execute("SELECT * FROM stock")
    items = [dict(id=row[0], name=row[1], system=row[2], actual=row[3], diff=row[4]) for row in c.fetchall()]
    conn.close()
    return jsonify(items)

@app.route('/api/stock', methods=['POST'])
def add_stock():
    data = request.json
    conn = sqlite3.connect('stock.db')
    c = conn.cursor()
    c.execute("INSERT INTO stock (name, system, actual, diff) VALUES (?, ?, ?, ?)",
              (data['name'], data['system'], data['actual'], data['diff']))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Data added'}), 201

@app.route('/api/stock/<int:item_id>', methods=['PUT'])
def update_stock(item_id):
    data = request.json
    conn = sqlite3.connect('stock.db')
    c = conn.cursor()
    c.execute("UPDATE stock SET name=?, system=?, actual=?, diff=? WHERE id=?",
              (data['name'], data['system'], data['actual'], data['diff'], item_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Data updated'})

@app.route('/api/stock/<int:item_id>', methods=['DELETE'])
def delete_stock(item_id):
    conn = sqlite3.connect('stock.db')
    c = conn.cursor()
    c.execute("DELETE FROM stock WHERE id=?", (item_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Data deleted'})

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
