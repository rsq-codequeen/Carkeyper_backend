const request = require('supertest');
const express = require('express');

jest.mock('../controllers/user.controller', () => ({
  getAllUsers: jest.fn((req, res) => res.status(200).json([])),
  createUser: jest.fn((req, res) => res.status(201).json({ message: 'User Created' })),
  updateUser: jest.fn((req, res) => res.status(200).json({ message: 'User Updated' })),
  deactivateUser: jest.fn((req, res) => res.status(200).json({ message: 'User Deactivated' }))
}));

jest.mock('../middleware/authJwt', () => ({
  verifyToken: (req, res, next) => next()
}));

jest.mock('../middleware/authRole', () => ({
  __esModule: true,
  default: {
    isAdmin: (req, res, next) => next()
  }
}));


const userRoutes = require('../routes/user.routes'); 
const userController = require('../controllers/user.controller');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Routes (Faked)', () => {

  it('GET /api/users - should return list for Admin', async () => {
    userController.getAllUsers.mockImplementation((req, res) => 
      res.status(200).json([{ id: 1, name: 'Admin User' }])
    );

    const res = await request(app).get('/api/users');
    
    expect(res.statusCode).toBe(200);
    expect(res.body[0].name).toBe('Admin User');
  });

  it('POST /api/users - should create user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ username: 'newuser', role: 'driver' });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User Created');
  });

  it('PUT /api/users/:id - should update user (Driver/Admin)', async () => {
    const res = await request(app)
      .put('/api/users/1')
      .send({ username: 'updatedname' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('User Updated');
  });

  it('DELETE /api/users/:id - should deactivate user', async () => {
    const res = await request(app).delete('/api/users/1');

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('User Deactivated');
  });
});