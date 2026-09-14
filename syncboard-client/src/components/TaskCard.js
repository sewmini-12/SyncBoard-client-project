import React, { useState } from 'react';
import './TaskCard.css';

const TaskCard = ({ 
  task, 
  onMoveTask, 
  onUpdateTask, 
  onDeleteTask,
  nextStatus, 
  nextLabel,
  prevStatus,
  prevLabel
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editAssignee, setEditAssignee] = useState(task.assignee || 'Unassigned');
  const [editPriority, setEditPriority] = useState(task.priority || 'Medium');

  const getPriorityColor = (priority) => {
    if (priority === 'High') return '#ff4757';
    if (priority === 'Medium') return '#ffa502';
    return '#2ed573';
  };

  // Use the correct ID from MongoDB
  const taskId = task._id || task.id;

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    
    const updatedTask = {
      ...task,
      title: editTitle,
      description: editDescription,
      assignee: editAssignee,
      priority: editPriority
    };
    
    await onUpdateTask(taskId, updatedTask);
    setIsEditing(false);
  };

  // Edit Mode
  if (isEditing) {
    return (
      <div className="task-card editing">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="Title"
          className="edit-input"
        />
        <input
          type="text"
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          placeholder="Description"
          className="edit-input"
        />
        <input
          type="text"
          value={editAssignee}
          onChange={(e) => setEditAssignee(e.target.value)}
          placeholder="Assignee"
          className="edit-input"
        />
        <select
          value={editPriority}
          onChange={(e) => setEditPriority(e.target.value)}
          className="edit-select"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <div className="edit-actions">
          <button onClick={handleSaveEdit} className="save-btn"> Save</button>
          <button onClick={() => setIsEditing(false)} className="cancel-btn"> Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="task-card">
      <h4>{task.title}</h4>
      <p className="task-description">{task.description || 'No description'}</p>
      <div className="task-footer">
        <span className="assignee">👤 {task.assignee || 'Unassigned'}</span>
        <span 
          className="priority" 
          style={{ background: getPriorityColor(task.priority) }}
        >
          {task.priority || 'Medium'}
        </span>
      </div>
      
      {/* ALL BUTTONS IN ONE ROW */}
      <div className="task-actions">
        {/* Move Back (Previous) */}
        {prevStatus && (
          <button 
            className="move-btn prev-btn"
            onClick={() => {
              console.log('Moving back:', taskId, 'to', prevStatus);
              onMoveTask(taskId, prevStatus);
            }}
          >
            {prevLabel}
          </button>
        )}
        
        {/* Move Forward (Next) */}
        {nextStatus && (
          <button 
            className="move-btn"
            onClick={() => {
              console.log('Moving forward:', taskId, 'to', nextStatus);
              onMoveTask(taskId, nextStatus);
            }}
          >
            {nextLabel}
          </button>
        )}
        
        {/* Edit */}
        <button 
          className="edit-btn"
          onClick={() => setIsEditing(true)}
        >
          Edit
        </button>
        
        {/* Delete */}
        <button 
          className="delete-btn"
          onClick={() => onDeleteTask(taskId)}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;