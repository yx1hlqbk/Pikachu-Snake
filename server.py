from flask import Flask, request, jsonify, send_from_directory
import sqlite3
import os
import time

app = Flask(__name__, static_folder='.', static_url_path='')

DB_NAME = 'leaderboard.db'

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    # Create table if not exists: name (PK), score, timestamp
    c.execute('''CREATE TABLE IF NOT EXISTS scores
                 (name TEXT PRIMARY KEY, score INTEGER, timestamp INTEGER)''')
    conn.commit()
    conn.close()

init_db()

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    # Get top 10 scores
    c.execute("SELECT name, score, timestamp FROM scores ORDER BY score DESC LIMIT 10")
    rows = c.fetchall()
    conn.close()
    
    leaderboard = []
    for row in rows:
        leaderboard.append({
            'name': row[0],
            'score': row[1],
            'date': row[2]
        })
    return jsonify(leaderboard)

@app.route('/api/score', methods=['POST'])
def update_score():
    data = request.json
    name = data.get('name')
    score = data.get('score')
    
    if not name or score is None:
        return jsonify({'error': 'Invalid data'}), 400
        
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    # Check existing score
    c.execute("SELECT score FROM scores WHERE name=?", (name,))
    row = c.fetchone()
    
    if row:
        # User exists
        current_score = row[0]
        if score > current_score:
            # Update only if new score is higher
            c.execute("UPDATE scores SET score=?, timestamp=? WHERE name=?", 
                      (score, int(time.time()*1000), name))
    else:
        # New user
        c.execute("INSERT INTO scores (name, score, timestamp) VALUES (?, ?, ?)", 
                  (name, score, int(time.time()*1000)))
                  
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

if __name__ == '__main__':
    print("Starting Snake Game Server...")
    print("Please open http://localhost:5500 in your browser")
    app.run(host='0.0.0.0', port=5500, debug=True)
