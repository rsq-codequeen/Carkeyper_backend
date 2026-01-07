const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserService=require('../models/user.service');

const JWT_SECRET = process.env.JWT_SECRET || 'password123';

class AuthController {
    async login(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({ message: 'Email and password are required.' });
        }
        try{
            const user = await UserService.findByEmail(email);
            if (!user || user.is_active === 0) {
                return res.status(401).send({ message: 'Invalid credentials.' });
            }

        
        
            const passwordIsValid = bcrypt.compareSync(password, user.password_hash);
            if (!passwordIsValid) {
                return res.status(401).send({ message: 'Invalid credentials.' });
            }
            //generating token
            const token = jwt.sign(
                { 
                    id: user.user_id, 
                    roleId: user.role_id 
                }, 
                JWT_SECRET,
                { expiresIn: '24h' } // Token expires after 24 hours
            );
            //force reset
            res.status(200).send({
                user: {
                    id: user.user_id,
                    email: user.email,
                    role_id: user.role_id,
                    // Send this flag to the frontend to force a password reset
                    force_password_change: user.force_password_change 
                },
                accessToken: token 
            });

        }
        catch(error){
            console.error('Login error:', error);
            res.status(500).send({ message: 'An internal error occurred during login.' });
        }
    }
}
module.exports = new AuthController();