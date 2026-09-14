import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import Column from './Column';
import './Board.css';

// ========== ENVIRONMENT-AWARE API & SOCKET URLs ==========
const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Relative path for Render (same domain)
  : 'http://localhost:5000/api';

// Socket connection – use relative path in production
const SOCKET_URL = process.env.NODE_ENV === 'production'
  ? '/'  // Same domain for Render
  : 'http://localhost:5000';

const socket = io(SOCKET_URL);

const Board = ({ onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [activityLog, setActivityLog] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const savedLog = localStorage.getItem('activityLog');
    if (savedLog) {
      setActivityLog(JSON.parse(savedLog));
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      setTasks(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load tasks.');
      setLoading(false);
    }
  };

  useEffect(() => {
    socket.on('taskUpdated', (updatedTask) => {
      console.log(' Real-time update received:', updatedTask);
      if (updatedTask.deleted) {
        setTasks(prev => prev.filter(t => t._id !== updatedTask._id));
        return;
      }
      setTasks(prev => {
        const exists = prev.some(t => t._id === updatedTask._id);
        return exists 
          ? prev.map(t => t._id === updatedTask._id ? updatedTask : t)
          : [updatedTask, ...prev];
      });
    });

    return () => socket.off('taskUpdated');
  }, []);

  useEffect(() => {
    fetchTasks();
    if (titleInputRef.current) titleInputRef.current.focus();
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const addActivity = (message) => {
    const newActivity = {
      id: Date.now(),
      message,
      timestamp: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString()
    };
    const updatedLog = [newActivity, ...activityLog].slice(0, 20);
    setActivityLog(updatedLog);
    localStorage.setItem('activityLog', JSON.stringify(updatedLog));
  };

  // ✅ NEW: Clear activity log function
  const clearActivity = () => {
    if (window.confirm('Clear all activity history?')) {
      setActivityLog([]);
      localStorage.removeItem('activityLog');
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) {
      setError('Task title is required.');
      return;
    }
    
    try {
      const payload = {
        title: newTaskTitle,
        description: newTaskDescription || '',
        status: 'todo',
        assignee: newTaskAssignee || 'Unassigned',
        priority: 'Medium'
      };
      console.log('Sending payload:', payload);

      const response = await axios.post(`${API_URL}/tasks`, payload);
      console.log('Task created:', response.data);
      
      setTasks([response.data, ...tasks]);
      socket.emit('taskUpdated', response.data);
      addActivity(`Created task: "${newTaskTitle}" by ${newTaskAssignee || 'Unassigned'}`);
      showSuccess('Task created successfully!');
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskAssignee('');
      if (titleInputRef.current) titleInputRef.current.focus();
    } catch (error) {
      console.error(' ERROR DETAILS:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      
      const errorMsg = error.response?.data?.error || error.message || 'Failed to create task. Please try again.';
      setError(errorMsg);
    }
  };

  const moveTask = async (taskId, newStatus) => {
    const statusLabels = { todo: 'To Do', doing: 'Doing', done: 'Done' };
    const confirmMessage = `Move this task to "${statusLabels[newStatus]}"?`;
    if (!window.confirm(confirmMessage)) return;
    
    try {
      const task = tasks.find(t => t._id === taskId || t.id === taskId);
      if (!task) return;
      
      const response = await axios.patch(`${API_URL}/tasks/${taskId}/move`, {
        status: newStatus
      });
      
      setTasks(tasks.map(t => (t._id === taskId || t.id === taskId) ? response.data : t));
      socket.emit('taskUpdated', response.data);
      
      addActivity(`Moved task "${task.title}" from ${statusLabels[task.status]} → ${statusLabels[newStatus]}`);
      showSuccess(`Task moved to ${statusLabels[newStatus]}!`);
    } catch (error) {
      console.error('Failed to move task:', error);
      setError(error.response?.data?.error || 'Failed to move task. Please try again.');
    }
  };

  const updateTask = async (taskId, updatedData) => {
    try {
      const response = await axios.put(`${API_URL}/tasks/${taskId}`, updatedData);
      setTasks(tasks.map(t => (t._id === taskId || t.id === taskId) ? response.data : t));
      socket.emit('taskUpdated', response.data);
      addActivity(`Updated task: "${updatedData.title || 'Untitled'}"`);
      showSuccess('Task updated successfully!');
    } catch (error) {
      console.error('Failed to update task:', error);
      setError(error.response?.data?.error || 'Failed to update task. Please try again.');
    }
  };

  const deleteTask = async (taskId) => {
    const confirmMessage = `Delete this task?`;
    if (!window.confirm(confirmMessage)) return;
    
    try {
      const task = tasks.find(t => t._id === taskId || t.id === taskId);
      await axios.delete(`${API_URL}/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId && t.id !== taskId));
      socket.emit('taskUpdated', { _id: taskId, deleted: true });
      addActivity(`Deleted task: "${task?.title || 'Untitled'}"`);
      showSuccess('Task deleted successfully!');
    } catch (error) {
      console.error('Failed to delete task:', error);
      setError(error.response?.data?.error || 'Failed to delete task. Please try again.');
    }
  };

  const assignees = ['all', ...new Set(tasks.map(t => t.assignee).filter(Boolean))];

  const getFilteredTasks = (status) => {
    let filtered = tasks.filter(t => t.status === status);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(term) ||
        (t.description && t.description.toLowerCase().includes(term))
      );
    }
    if (filterAssignee !== 'all') {
      filtered = filtered.filter(t => t.assignee === filterAssignee);
    }
    if (filterPriority !== 'all') {
      filtered = filtered.filter(t => t.priority === filterPriority);
    }
    return filtered;
  };

  const columns = [
    { id: 'todo', title: 'To Do', tasks: getFilteredTasks('todo'), nextStatus: 'doing', nextLabel: '→ Doing', prevStatus: null, prevLabel: null },
    { id: 'doing', title: 'Doing', tasks: getFilteredTasks('doing'), nextStatus: 'done', nextLabel: '→ Done', prevStatus: 'todo', prevLabel: '← To Do' },
    { id: 'done', title: 'Done', tasks: getFilteredTasks('done'), nextStatus: null, nextLabel: null, prevStatus: 'doing', prevLabel: '← Doing' },
  ];

  if (loading) return (
    <div className="board-container">
      <div className="board-header">
        <h1><span>Sync</span>Board</h1>
        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme}>{isDarkMode ? '☀️' : '🌙'}</button>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </div>
      <div className="loading-spinner-container"><div className="loading-spinner"></div><p>Loading your tasks...</p></div>
    </div>
  );

  if (error) return (
    <div className="board-container">
      <div className="board-header">
        <h1><span>Sync</span>Board</h1>
        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme}>{isDarkMode ? '☀️' : '🌙'}</button>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </div>
      <div className="error-container">
        <h2> {error}</h2>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
          <button 
            onClick={() => { setError(null); fetchTasks(); }} 
            className="retry-btn"
          >
            Retry
          </button>
          <button 
            onClick={() => setError(null)} 
            className="dismiss-btn"
            style={{
              padding: '10px 30px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="board-container">
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <div className="board-header">
        <h1><span>Sync</span>Board</h1>
        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme}>{isDarkMode ? '☼' : '☾'}</button>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      {/* ✅ UPDATED: Activity toggle with Clear button */}
      <div className="activity-toggle">
        <button onClick={() => document.querySelector('.activity-log').classList.toggle('show')}>
          Activity Log ({activityLog.length})
        </button>
        {activityLog.length > 0 && (
          <button onClick={clearActivity} className="clear-log-btn">
            🗑️ Clear
          </button>
        )}
      </div>

      <div className="activity-log">
        <h4>Recent Activity</h4>
        {activityLog.length === 0 ? (
          <p className="no-activity">No activity yet</p>
        ) : (
          activityLog.slice(0, 10).map(activity => (
            <div key={activity.id} className="activity-item">
              <span className="activity-time">{activity.timestamp}</span>
              <span className="activity-message">{activity.message}</span>
            </div>
          ))
        )}
      </div>
      
      <div className="task-input">
        <input ref={titleInputRef} type="text" placeholder="Task title..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleCreateTask()} className="task-title-input" />
        <input type="text" placeholder="Description..." value={newTaskDescription} onChange={(e) => setNewTaskDescription(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleCreateTask()} className="task-desc-input" />
        <input type="text" placeholder="Assign to..." value={newTaskAssignee} onChange={(e) => setNewTaskAssignee(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleCreateTask()} className="task-assignee-input" />
        <button onClick={handleCreateTask}>Add Task</button>
      </div>

      <div className="search-filter">
        <input type="text" placeholder=" Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
        <select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)} className="filter-select">
          <option value="all">All Assignees</option>
          {assignees.filter(a => a !== 'all').map(assignee => <option key={assignee} value={assignee}>{assignee}</option>)}
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="filter-select">
          <option value="all">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>
      
      <div className="board-columns">
        {columns.map(col => (
          <Column key={col.id} title={col.title} tasks={col.tasks} onMoveTask={moveTask} onUpdateTask={updateTask} onDeleteTask={deleteTask} nextStatus={col.nextStatus} nextLabel={col.nextLabel} prevStatus={col.prevStatus} prevLabel={col.prevLabel} />
        ))}
      </div>
    </div>
  );
};

export default Board;