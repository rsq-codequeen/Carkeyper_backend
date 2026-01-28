const request = require('supertest');
const express = require('express');

jest.mock('../controllers/auth.controller', () => ({
  login: jest.fn()
}));

const authRoutes = require('../routes/auth.routes');
const authController = require('../controllers/auth.controller');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes (Faked)', () => {

  it('POST /api/auth/login - should return token on successful login', async () => {
    authController.login.mockImplementation((req, res) => {
      res.status(200).json({
        message: "Login successful",
        accessToken: "fake-jwt-token",
        username: "testuser"
      });
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.accessToken).toBe('fake-jwt-token');
  });

  it('POST /api/auth/login - should return 401 for invalid credentials', async () => {
    authController.login.mockImplementation((req, res) => {
      res.status(401).json({ message: "Invalid Password!" });
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid Password!');
  });
});