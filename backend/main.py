from flask import Flask, request, jsonify, session
from flask_cors import CORS
import sqlite3
import hashlib
import os

app = Flask(__name__)
app.secret_key = "todo-app-secret"
CORS(app, supports_credentials=True, origins=['http://localhost:5173'])

DB_PATH = 'tasks.db'

# Initialize database
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Users table
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    
    # Tasks table
    c.execute('''CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT,
        completed INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )''')
    
    conn.commit()
    conn.close()


init_db()


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def is_logged_in():
    return 'user_id' in session

def get_current_user_id():
    return session.get('user_id')

# AUTH ENDPOINTS

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        if not username or not email or not password:
            return jsonify({"success": False, "message": "All fields required"}), 400
        
        if len(password) < 6:
            return jsonify({"success": False, "message": "Password must be 6+ characters"}), 400
        
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        hashed_pw = hash_password(password)
        
        try:
            c.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                      (username, email, hashed_pw))
            conn.commit()
            conn.close()
            return jsonify({"success": True, "message": "User created successfully"}), 201
        except sqlite3.IntegrityError:
            conn.close()
            return jsonify({"success": False, "message": "Username or email already exists"}), 400
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({"success": False, "message": "Username and password required"}), 400
        
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        hashed_pw = hash_password(password)
        
        c.execute('SELECT id FROM users WHERE username = ? AND password = ?',
                  (username, hashed_pw))
        user = c.fetchone()
        conn.close()
        
        if user:
            session['user_id'] = user[0]
            return jsonify({"success": True, "message": "Login successful", "user_id": user[0]}), 200
        else:
            return jsonify({"success": False, "message": "Invalid username or password"}), 401
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"success": True, "message": "Logged out successfully"}), 200

# TASK ENDPOINTS

@app.route('/api/me', methods=['GET'])
def get_me():
    """Get current logged-in user info"""
    if not is_logged_in():
        return jsonify({"success": False, "message": "Not logged in"}), 401
    
    try:
        user_id = get_current_user_id()
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('SELECT id, username, email FROM users WHERE id = ?', (user_id,))
        user = c.fetchone()
        conn.close()
        
        if user:
            return jsonify({
                "success": True, 
                "user": {"id": user[0], "username": user[1], "email": user[2]}
            }), 200
        else:
            return jsonify({"success": False, "message": "User not found"}), 404
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    if not is_logged_in():
        return jsonify({"success": False, "message": "Not logged in"}), 401
    
    try:
        user_id = get_current_user_id()
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        
        c.execute('''SELECT id, title, description, due_date, completed, created_at
                     FROM tasks WHERE user_id = ? ORDER BY created_at DESC''', (user_id,))
        tasks = c.fetchall()
        conn.close()
        
        task_list = []
        for task in tasks:
            task_list.append({
                "id": task[0],
                "title": task[1],
                "description": task[2],
                "due_date": task[3],
                "completed": bool(task[4]),
                "created_at": task[5]
            })
        
        return jsonify({"success": True, "tasks": task_list}), 200
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/tasks', methods=['POST'])
def create_task():
    if not is_logged_in():
        return jsonify({"success": False, "message": "Not logged in"}), 401
    
    try:
        data = request.get_json()
        title = data.get('title', '').strip()
        description = data.get('description', '').strip()
        due_date = data.get('due_date')
        
        if not title:
            return jsonify({"success": False, "message": "Task title required"}), 400
        
        user_id = get_current_user_id()
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        
        c.execute('''INSERT INTO tasks (user_id, title, description, due_date, completed)
                     VALUES (?, ?, ?, ?, 0)''',
                  (user_id, title, description, due_date))
        conn.commit()
        task_id = c.lastrowid
        conn.close()
        
        return jsonify({"success": True, "message": "Task created", "task_id": task_id}), 201
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    if not is_logged_in():
        return jsonify({"success": False, "message": "Not logged in"}), 401
    
    try:
        data = request.get_json()
        user_id = get_current_user_id()
        
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        
        updates = []
        params = []
        
        if 'title' in data:
            updates.append("title = ?")
            params.append(data['title'])
        if 'description' in data:
            updates.append("description = ?")
            params.append(data['description'])
        if 'due_date' in data:
            updates.append("due_date = ?")
            params.append(data['due_date'])
        if 'completed' in data:
            updates.append("completed = ?")
            params.append(int(data['completed']))
        
        if not updates:
            return jsonify({"success": False, "message": "No fields to update"}), 400
        
        updates.append("updated_at = CURRENT_TIMESTAMP")
        params.append(task_id)
        params.append(user_id)
        
        query = f"UPDATE tasks SET {', '.join(updates)} WHERE id = ? AND user_id = ?"
        c.execute(query, params)
        conn.commit()
        conn.close()
        
        return jsonify({"success": True, "message": "Task updated"}), 200
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    if not is_logged_in():
        return jsonify({"success": False, "message": "Not logged in"}), 401
    
    try:
        user_id = get_current_user_id()
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        
        c.execute('DELETE FROM tasks WHERE id = ? AND user_id = ?', (task_id, user_id))
        conn.commit()
        conn.close()
        
        return jsonify({"success": True, "message": "Task deleted"}), 200
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# Error handling
@app.errorhandler(404)
def not_found(error):
    return jsonify({"success": False, "message": "Endpoint not found"}), 404

if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)