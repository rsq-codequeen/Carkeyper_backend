const bcrypt = require('bcryptjs');
const pool = require('../config/db.config');
class UserService{
    async findByEmail(email) {
        const query = `
            SELECT 
                user_id, first_name, last_name, email,contact_number, password_hash, role_id, is_active, force_password_change 
            FROM Users 
            WHERE email = ?;
        `;
        const [rows] = await pool.query(query, [email]);
        return rows[0];
    }
    async create(userData) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const tempPassword = Math.random().toString(36).substring(2, 12);
        const passwordHash = await bcrypt.hash(tempPassword, 10);

        const { first_name, last_name, email, contact_number, role_id } = userData;

        const query = `
            INSERT INTO Users 
            (first_name, last_name, email, contact_number, password_hash, role_id, is_active, force_password_change)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `;
        
        // Ensure this variable is named 'result'
        const [result] = await connection.query(query, [
            first_name, last_name, email, contact_number, passwordHash, role_id, 1, 1
        ]);

        // Audit Log
        await connection.query(
            `INSERT INTO Audit_Logs (timestamp, user_id, action_type, details) VALUES (NOW(), ?, ?, ?)`,
            [null, 'USER_CREATION', `Created user ${email}`]
        );

        await connection.commit();

        // result.insertId is now accessible because 'result' was defined above
        return {
            userId: result.insertId,
            temporaryPassword: tempPassword
        };
    } catch (error) {
        await connection.rollback();
        throw error; // This sends the error to user.controller.js
    } finally {
        connection.release();
    }
}

    async findAll() {
        const query = `
            SELECT u.user_id, u.first_name, u.last_name, u.email,u.contact_number, r.role_name, u.is_active
            FROM Users u
            JOIN Roles r ON u.role_id = r.role_id
            ORDER BY u.user_id
            ;
        `;
        const [rows] = await pool.query(query);
        return rows;
    }
    async update(userId, userData) {
        // Build the query dynamically for robust updates
        const updateFields = [];
        const updateValues = [];

        if (userData.password) {
        // Hash the password before it touches the database
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(userData.password, salt);
        
        // Add the hash to our update arrays
        updateFields.push(`password_hash = ?`);
        updateValues.push(hashed);
    }
        // Define a list of allowed, updatable fields
        const allowedFields = ['first_name', 'last_name', 'email','contact_number', 'role_id', 'is_active', 'force_password_change'];

        for (const field of allowedFields) {
            if (userData[field] !== undefined) {
                updateFields.push(`${field} = ?`);
                updateValues.push(userData[field]);
            }
        }

        // Must have fields to update and a user ID
        if (updateFields.length === 0) {
            return { affectedRows: 0 }; // Nothing to update
        }

        const query = `
            UPDATE Users 
            SET ${updateFields.join(', ')}
            WHERE user_id = ?;
        `;
        
        // Add the userId to the end of the values array for the WHERE clause
        updateValues.push(userId);

        try {
            const [result] = await pool.query(query, updateValues);
            return { affectedRows: result.affectedRows };
        } catch (dbError) {
            console.error('SQL Update Failed:', dbError.message);
            throw dbError;
        }
    }

   async delete(userId) {
        // Soft delete: Set is_active to 0
        const query = `
            UPDATE Users 
            SET is_active = 0 
            WHERE user_id = ? AND is_active = 1;
        `;

        try {
            const [result] = await pool.query(query, [userId]);
            // Returns the number of rows actually updated (should be 1 if successful)
            return { affectedRows: result.affectedRows };
        } catch (dbError) {
            console.error('SQL Deactivate Failed:', dbError.message);
            throw dbError;
        }
    }

}
module.exports = new UserService();
