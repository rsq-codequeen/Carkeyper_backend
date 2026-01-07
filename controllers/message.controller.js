const pool = require('../config/db.config');

const MessageController = {
    // Get sidebar list of conversations
    async getConversations(req, res) {
        try {
            const adminId = req.query.adminId;
            const [rows] = await pool.query(`
                SELECT DISTINCT u.user_id, u.first_name, u.last_name, 
                (SELECT message_text FROM Messages 
                 WHERE (sender_id = u.user_id OR receiver_id = u.user_id) 
                 ORDER BY created_at DESC LIMIT 1) as last_message
                FROM Users u
                JOIN Messages m ON u.user_id = m.sender_id OR u.user_id = m.receiver_id
                WHERE u.user_id != ?`, [adminId]);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Get chat history between two users
    async getChatHistory(req, res) {
        const { userId, contactId } = req.params;
        try {
            const [rows] = await pool.query(
                `SELECT * FROM Messages 
                 WHERE (sender_id = ? AND receiver_id = ?) 
                 OR (sender_id = ? AND receiver_id = ?) 
                 ORDER BY created_at ASC`,
                [userId, contactId, contactId, userId]
            );
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Save message to database
    async saveMessage(req, res) {
        const { sender_id, receiver_id, message_text } = req.body;
        try {
            await pool.query(
                'INSERT INTO Messages (sender_id, receiver_id, message_text) VALUES (?, ?, ?)',
                [sender_id, receiver_id, message_text]
            );
            res.status(201).json({ message: "Message saved successfully" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = MessageController;