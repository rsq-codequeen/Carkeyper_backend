const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/message.controller');
const { verifyToken } = require('../middleware/authJwt');

// Protect all chat routes with verifyToken
router.get('/conversations', verifyToken, MessageController.getConversations);
router.get('/:userId/:contactId', verifyToken, MessageController.getChatHistory);
router.post('/', verifyToken, MessageController.saveMessage);

module.exports = router;