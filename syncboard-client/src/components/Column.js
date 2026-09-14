import React from 'react';
import TaskCard from './TaskCard';
import './Column.css';

const Column = ({ 
  title, 
  tasks, 
  onMoveTask, 
  onUpdateTask, 
  onDeleteTask,
  nextStatus, 
  nextLabel,
  prevStatus,
  prevLabel
}) => {
  return (
    <div className="column">
      <div className="column-header">
        <h3>{title}</h3>
        <span className="task-count">{tasks.length}</span>
      </div>
      <div className="task-list">
        {tasks.map(task => (
          <TaskCard 
            key={task._id || task.id} 
            task={task} 
            onMoveTask={onMoveTask}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            nextStatus={nextStatus}
            nextLabel={nextLabel}
            prevStatus={prevStatus}
            prevLabel={prevLabel}
          />
        ))}
        {tasks.length === 0 && (
          <div className="empty-column">No tasks</div>
        )}
      </div>
    </div>
  );
};

export default Column;