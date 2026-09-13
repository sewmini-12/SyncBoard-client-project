const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// IN-MEMORY DATABASE (Mock Data)
let tasks = [
  { id: 1, title: "Design System Setup", description: "Create color palette and typography.", status: "todo", assignee: "prabath", priority: "High" },
  { id: 2, title: "API Documentation", description: "Write OpenAPI specs for endpoints.", status: "todo", assignee: "Dinithi", priority: "Medium" },
  { id: 3, title: "Build Authentication UI", description: "Implement login and register forms.", status: "doing", assignee: "Tharuka", priority: "High" },
  { id: 4, title: "Setup MongoDB Schema", description: "Design Task and User schemas.", status: "doing", assignee: "Siwrangi", priority: "Medium" },
  { id: 5, title: "Deploy to Render", description: "Configure production environment.", status: "done", assignee: "Prabath", priority: "Low" },
  { id: 6, title: "Initial Project Scaffold", description: "Initialize React and Express.", status: "done", assignee: "Dinithi", priority: "High" }
];
let nextId = 7;

// API ROUTES
// GET all tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// GET a single task
app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// POST create a new task
app.post('/api/tasks', (req, res) => {
  const { title, description, status, assignee, priority } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  
  const newTask = {
    id: nextId++,
    title,
    description: description || '',
    status: status || 'todo',
    assignee: assignee || 'Unassigned',
    priority: priority || 'Medium'
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT update a task
app.put('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ error: 'Task not found' });
  
  tasks[index] = { ...tasks[index], ...req.body, id };
  res.json(tasks[index]);
});

// DELETE a task
app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ error: 'Task not found' });
  
  tasks.splice(index, 1);
  res.status(204).send();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` API Endpoints:`);
  console.log(`   GET    /api/tasks     - Get all tasks`);
  console.log(`   GET    /api/tasks/:id - Get one task`);
  console.log(`   POST   /api/tasks     - Create a task`);
  console.log(`   PUT    /api/tasks/:id - Update a task`);
  console.log(`   DELETE /api/tasks/:id - Delete a task`);
  console.log(`   GET    /api/health    - Health check`);
});