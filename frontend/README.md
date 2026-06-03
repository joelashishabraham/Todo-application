# To-Do Application

A full-stack to-do application with user authentication, task management, and persistent sessions.

## Features

**User Authentication**
- User registration with email validation
- Secure login with password hashing
- Logout functionality

**Task Management**
- Create tasks with title, description, and due date
- View all tasks in a organized list
- Edit existing tasks
- Delete tasks
- Mark tasks as complete/incomplete

## Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **CSS3** - Styling

### Backend
- **Python Flask** - Web framework
- **SQLite** - Database
- **Flask-CORS** - Cross-origin requests

## Installation

### Prerequisites
- Node.js (v16+)
- Python 3.8+

### Backend Setup

```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Start Backend (Terminal 1)

```bash
cd backend
venv\Scripts\activate
python main.py
```

Backend runs on: `http://localhost:5000`

### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:5173`

## Usage

1. **Open** `http://localhost:5173` in your browser
2. **Register** - Create a new account
3. **Login** - Sign in with your credentials
4. **Add Task** - Click "+ Add Task" button to create a new task
5. **Edit Task** - Click "Edit" to modify a task
6. **Complete Task** - Check the checkbox to mark as complete
7. **Delete Task** - Click "Delete" to remove a task
8. **Logout** - Click "Logout" button to sign out

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/me` - Get current user info

### Tasks
- `GET /api/tasks` - Get all tasks for user
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/<id>` - Update task
- `DELETE /api/tasks/<id>` - Delete task

## Author

Joel