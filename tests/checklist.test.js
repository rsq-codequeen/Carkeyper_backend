const request = require('supertest');
const express = require('express');

jest.mock('../controllers/message.controller', () => ({
  getConversations: jest.fn((req, res) => res.status(200).json([])),
  getChatHistory: jest.fn((req, res) => res.status(200).json([])),
  saveMessage: jest.fn((req, res) => res.status(201).json({ message: 'Message sent' }))
}));


jest.mock('../middleware/authJwt', () => ({
  verifyToken: (req, res, next) => next()
}));


const messageRoutes = require('../routes/message.routes');
const MessageController = require('../controllers/message.controller');

const app = express();
app.use(express.json());
app.use('/api/messages', messageRoutes);

describe('Message Routes (Faked)', () => {

  it('GET /api/messages/conversations - should return a list of conversations', async () => {
    MessageController.getConversations.mockImplementation((req, res) => 
      res.status(200).json([{ contactId: 5, lastMessage: 'Hello!' }])
    );

    const res = await request(app).get('/api/messages/conversations');
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body[0].contactId).toBe(5);
  });

  it('GET /api/messages/:userId/:contactId - should return chat history', async () => {
    MessageController.getChatHistory.mockImplementation((req, res) => 
      res.status(200).json([{ senderId: 1, text: 'Hi there' }])
    );

    const res = await request(app).get('/api/messages/1/5');

    expect(res.statusCode).toBe(200);
    expect(res.body[0].text).toBe('Hi there');
  });

  it('POST /api/messages - should save a new message', async () => {
    const res = await request(app)
      .post('/api/messages')
      .send({ contactId: 5, text: 'New test message' });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Message sent');
  });
});