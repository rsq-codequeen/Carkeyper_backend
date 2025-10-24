// controllers/user.controller.js

const UserService = require('../models/user.service'); 

class UserController {
    
    // Handles GET /api/users
    // Fetches a list of all users for the Admin dashboard.
    async getAllUsers(req, res) {
        try {
            const users = await UserService.findAll();
            res.status(200).send(users);
        } catch (error) {
            console.error('Error fetching all users:', error);
            res.status(500).send({ message: 'Error retrieving user list.' });
        }
    }

    // Handles POST /api/users
    // Creates a new user with a temporary password (Admin function).
    async createUser(req, res) {
        const userData = req.body;
        
        // Enhanced validation
        const requiredFields = ['email', 'role_id', 'first_name', 'last_name'];
        const missingFields = requiredFields.filter(field => !userData[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).send({ 
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        try {
            // Check for duplicate email
            const existingUser = await UserService.findByEmail(userData.email);
            if (existingUser) {
                return res.status(409).send({ 
                    message: 'User with this email already exists.' 
                });
            }

            // Create user
            const result = await UserService.create(userData);
            
            // Proper success response with 201 status
            return res.status(201).send({ 
                message: 'User created successfully.',
                userId: result.userId,
                temporaryPassword: result.temporaryPassword 
            });

        } catch (error) {
            console.error('Error creating user:', error); 
            return res.status(500).send({ 
                message: 'Internal error during user creation.',
                error: error.message  // Adding error message for debugging
            });
        }
    }

    // Handles PUT /api/users/:id (e.g., changing role, toggling active status)
    async updateUser(req, res) {
        const userId = req.params.id;
        const updateData = req.body;
        
        try {
            const result = await UserService.update(userId, updateData); // <-- New Service Call
            
            if (result.affectedRows === 0) {
                 return res.status(404).send({ message: `User ${userId} not found or no changes made.` });
            }
            
            res.status(200).send({ message: `User ${userId} updated successfully.` });
        } catch (error) {
           // ...
        }
    }

    // Handles DELETE /api/users/:id (Soft delete/Deactivate)
    async deactivateUser(req, res) {
        const userId = req.params.id;

        // This method relies on you implementing UserService.delete() (soft delete logic)
        try {
            // Placeholder for the actual service call:
            // await UserService.delete(userId); 
            const result = await UserService.delete(userId); // <-- New Service Call
            
            if (result.affectedRows === 0) {
                return res.status(404).send({ message: `User ${userId} not found or already inactive.` });
            }
            res.status(200).send({ message: `User ${userId} deactivated successfully.` });
        } catch (error) {
             console.error('Error deactivating user:', error);
            res.status(500).send({ message: 'Internal error deactivating user.' });
        }
    }
}

module.exports = new UserController();