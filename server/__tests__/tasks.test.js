const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');

// Close MongoDB connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Tasks API Tests', () => {
  test('GET /api/tasks returns array of tasks', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/tasks creates a new task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Test Task', assignee: 'Tester' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Task');
  });

  test('DELETE /api/tasks/:id removes a task', async () => {
    const create = await request(app)
      .post('/api/tasks')
      .send({ title: 'To Delete' });
    const id = create.body._id;
    const del = await request(app).delete(`/api/tasks/${id}`);
    expect(del.statusCode).toBe(204);
  });
});