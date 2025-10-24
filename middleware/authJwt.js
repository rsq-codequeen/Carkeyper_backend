// middleware/authJwt.js

const jwt = require('jsonwebtoken');

// Load JWT_SECRET from .env
const JWT_SECRET = process.env.JWT_SECRET || 'password123'; 

// Middleware function to verify the token
const verifyToken = (req, res, next) => {
    // 1. Get token from the Authorization header (Bearer <token>)
    let token = req.headers['x-access-token'] || req.headers['authorization'];

    if (token && token.startsWith('Bearer ')) {
        // Remove "Bearer " from the string
        token = token.slice(7, token.length);
    }

    if (!token) {
        // If no token is provided, reject with 403 Forbidden
        return res.status(403).send({
            message: 'No token provided! Access denied.'
        });
    }

    // 2. Verify the token using the secret key
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            // Token is invalid or expired
            return res.status(401).send({
                message: 'Unauthorized! Invalid or expired token.'
            });
        }
        
        // 3. If valid, attach user data to the request object
        req.userId = decoded.id; 
        req.roleId = decoded.roleId; 
        
        // Move to the next middleware or controller function
        next(); 
    });
};

module.exports = {
    verifyToken
};