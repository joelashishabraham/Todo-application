import { useState } from 'react';
import '../styles/TaskForm.css';

export default function TaskForm({ userId, onTaskAdded, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Task title required');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          due_date: dueDate || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Task created, refresh list
        setTitle('');
        setDescription('');
        setDueDate('')
        
        // Fetch the new task to display
        const taskResponse = await fetch('http://localhost:5000/api/tasks', {
          method: 'GET',
          credentials: 'include',
        });
        const taskData = await taskResponse.json();
        if (taskData.success && taskData.tasks.length > 0) {
          onTaskAdded(taskData.tasks[0]); // Add newest task
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error creating task: ' + err.message);
    }
  };

  return (
    <div className="task-form">
      <h2>Add New Task</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Task description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
        />

        <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button type="submit">Add Task</button>
        {onCancel && (
        <button type="button" onClick={onCancel} className="cancel-form-btn">
  Cancel
  </button>
)}
      </form>
    </div>
  );
}