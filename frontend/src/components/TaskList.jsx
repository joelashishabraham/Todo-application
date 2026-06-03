import { useState, useEffect } from 'react';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';
import '../styles/TaskList.css';

export default function TaskList({ userId, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Fetch tasks when component loads
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setTasks(data.tasks);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error fetching tasks: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAdded = (newTask) => {
    setTasks([newTask, ...tasks]);
  };

  const handleTaskDeleted = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleLogout = async () => {
    await fetch('http://localhost:5000/api/logout', {
      method: 'POST',
      credentials: 'include',
    });
    onLogout();
  };

  if (loading) return <div className="task-container">Loading...</div>;

  return (
    <div className="task-container">
      <div className="task-header">
        <h1>My Tasks</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      {error && <p className="error">{error}</p>}

      {showForm && (
  <TaskForm 
    userId={userId} 
    onTaskAdded={(task) => {
      handleTaskAdded(task);
      setShowForm(false);  // Hide form after adding
    }}
    onCancel={() => setShowForm(false)}  // Hide on cancel
  />
)}

{!showForm && (
  <button onClick={() => setShowForm(true)} className="add-task-btn">
    + Add Task
  </button>
)}
      <div className="task-list">
        {tasks.length === 0 ? (
          <p className="no-tasks">No tasks yet. Create one to get started!</p>
        ) : (
            tasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onTaskDeleted={handleTaskDeleted}
                  onTaskUpdated={handleTaskUpdated}
                />
              ))
        )}
      </div>
    </div>
  );
}