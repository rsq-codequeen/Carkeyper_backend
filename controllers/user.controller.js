// controllers/user.controller.js

const UserService = require('../models/user.service'); 
const EmailService=require('../utilities/email.service')
class UserController {
    // Handles GET /api/users
    // Fetches a list of all users for the Admin dashboard.
    async getAllUsers(req, res) {
        try {
            const usersFromDb = await UserService.findAll();
            const users = usersFromDb.map(user => ({
            // Combine first_name and last_name into 'name'
            name: `${user.first_name} ${user.last_name}`, 
            email: user.email,
            // Assuming your SQL SELECT is aliasing role_name as 'role'
            role: user.role_name, 
            
            // Add other fields needed by the frontend, even if empty/null
            // We need to fix contact next, but for now:
            contact: user.contact_number || 'N/A', // Placeholder until DB fixed
            assignedVehicles: user.assigned_vehicles || 'None', 
            
            // Pass all original fields needed for edit/delete (like IDs)
            id: user.user_id,
            ...user 
        }));
            
            res.status(200).send(users);
        } catch (error) {
            console.error('Error fetching all users:', error);
            res.status(500).send({ message: 'Error retrieving user list.' });
        }
    }

    // Handles POST /api/users
    // Create a new user with a temporary password (Admin function).
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
            console.log("------------------------------------------");
        console.log("NEW USER CREATED:");
        console.log("Email:", userData.email);
        console.log("Temporary Password:", result.temporaryPassword); 
        console.log("------------------------------------------");
        try {
            await EmailService.sendTempPasswordEmail(
                userData.email, 
                result.temporaryPassword, 
                userData.first_name
            );
            console.log(`✓ Welcome email sent to: ${userData.email}`);
        } catch (emailError) {
            // We log the error but still return 201 because the user exists in DB
            console.error('⚠ Email Service Error:', emailError.message);
        }
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
    const targetUserId = req.params.id;
    const updateData = req.body;
    
    // req.userId is usually set by your verifyToken middleware
    const authenticatedUserId = req.userId; 
    const authenticatedUserRole = req.userRole; // Or however your middleware stores role

    try {
        // SECURITY CHECK
        // If the user is NOT an admin AND is trying to update someone else's ID...
        if (authenticatedUserRole !== 1 && authenticatedUserId != targetUserId) {
            return res.status(403).send({ 
                message: "Forbidden: You can only update your own profile." 
            });
        }

        const result = await UserService.update(targetUserId, updateData);
        
        if (result.affectedRows === 0) {
             return res.status(404).send({ message: `User ${targetUserId} not found or no changes made.` });
        }
        
        res.status(200).send({ message: `User ${targetUserId} updated successfully.` });
    } catch (error) {
        console.error("Update Controller Error:", error);
        res.status(500).send({ message: "Internal server error during update." });
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