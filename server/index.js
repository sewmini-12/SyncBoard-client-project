const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// -------------------- MIDDLEWARE --------------------
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? '*' 
    : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());

// -------------------- MONGODB CONNECTION --------------------
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/collabboard';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// -------------------- MODELS & ROUTES --------------------
const Task = require('./models/Task');
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// -------------------- TASK ROUTES --------------------

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, status, assignee, priority } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const newTask = new Task({
      title,
      description: description || '',
      status: status || 'todo',
      assignee: assignee || 'Unassigned',
      priority: priority || 'Medium'
    });

    const saved = await newTask.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { title, description, status, assignee, priority } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (assignee !== undefined) updateData.assignee = assignee;
    if (priority !== undefined) updateData.priority = priority;
    updateData.updatedAt = new Date();

    const task = await Task.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.patch('/api/tasks/:id/move', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });
    const task = await Task.findByIdAndUpdate(req.params.id, { status, updatedAt: new Date() }, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    console.error('Error moving task:', error);
    res.status(500).json({ error: 'Failed to move task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// ========== SERVE REACT FRONTEND ==========
app.use(express.static(path.join(__dirname, '../syncboard-client/build')));

// ✅ Single catch-all route for React Router (Express 5.x compatible)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../syncboard-client/build', 'index.html'));
  } else {
    next();
  }
});

// -------------------- SOCKET.IO --------------------
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

io.on('connection', (socket) => {
  console.log(`🟢 User connected: ${socket.id}`);
  socket.on('taskUpdated', (data) => socket.broadcast.emit('taskUpdated', data));
  socket.on('disconnect', () => console.log(`🔴 User disconnected: ${socket.id}`));
});

// -------------------- START SERVER --------------------
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`✅ Serving frontend from /syncboard-client/build`);
  });
}

// ✅ CRITICAL: Export the app for tests!
module.exports = app;