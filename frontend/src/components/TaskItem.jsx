import { useState } from 'react';
import '../styles/TaskItem.css';

export default function TaskItem({ task, onTaskDeleted, onTaskUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editDueDate, setEditDueDate] = useState(task.due_date || '');
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;

    setError('');

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${task.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        onTaskDeleted(task.id);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error deleting task: ' + err.message);
    }
  };

  const handleToggleComplete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onTaskUpdated({ ...task, completed: !task.completed });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error updating task: ' + err.message);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      setError('Title cannot be empty');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        onTaskUpdated({
          ...task,
          title: editTitle,
          description: editDescription,
          due_date: editDueDate || null,
        });
        setIsEditing(false);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error updating task: ' + err.message);
    }
  };

  if (isEditing) {
    return (
      <div className="task-item editing">
        <div className="edit-form">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Task title"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description (optional)"
            rows="2"
          />
        <input
        type="date"
        value={task.due_date || ''}
        onChange={(e) => setEditDueDate(e.target.value)}
        />
          {error && <p className="error">{error}</p>}
          <div className="edit-buttons">
            <button onClick={handleSaveEdit} className="save-btn">Save</button>
            <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-content">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggleComplete}
          className="task-checkbox"
        />

        <div className="task-text">
        <div className="task-title-row">
            <h3 style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
            {task.title}
            </h3>
            {task.completed && <span className="completed-badge">✓ Completed</span>}
        </div>
        {task.description && <p>{task.description}</p>}
        {task.due_date && <p className="due-date">Due: {new Date(task.due_date).toLocaleDateString()}</p>}
        </div>
      </div>

      <div className="task-actions">
        <button
          onClick={() => setIsEditing(true)}
          className="edit-btn"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="delete-btn"
        >
          Delete
        </button>
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
}