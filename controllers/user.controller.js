const UserService = require('../models/user.service');

const EmailService=require('../utilities/email.service')

class UserController {
    async assignVehicle(req, res) {
    const userId = req.params.id;
    const { vehicleId } = req.body;

    if (!vehicleId) {
        return res.status(400).send({ message: "Vehicle ID is required." });
    }

    try {
        // We call the Service method we planned earlier
        await UserService.assignVehicle(userId, vehicleId);
        
        res.status(200).send({ 
            message: `Vehicle ${vehicleId} successfully assigned to User ${userId}.` 
        });
    } catch (error) {
        console.error("Assignment Controller Error:", error);
        res.status(500).send({ message: "Failed to assign vehicle." });
    }
}
    async getAllUsers(req, res) {

        try {

            const usersFromDb = await UserService.findAll();

            // Inside getAllUsers(req, res)
const users = usersFromDb.map(user => ({
    id: user.user_id,
    name: `${user.first_name} ${user.last_name}`,
    email: user.email,
    role: user.role_name,
    contact: user.contact_number || 'N/A',
    
    // UPDATED: Match the alias names from your new SQL query
    assignedVehicles: user.assigned_vehicle_model 
        ? `${user.assigned_vehicle_model} (${user.assigned_vehicle_plate})` 
        : 'None',
    
    // Optional: add the start date if you want to show it in the UI
    assignmentDate: user.assignment_start_date || null,

    ...user 
}));

           

            res.status(200).send(users);

        } catch (error) {

            console.error('Error fetching all users:', error);

            res.status(500).send({ message: 'Error retrieving user list.' });

        }

    }

    async createUser(req, res) {

        const userData = req.body;

        const requiredFields = ['email', 'role_id', 'first_name', 'last_name'];

        const missingFields = requiredFields.filter(field => !userData[field]);

        if (missingFields.length > 0) {

            return res.status(400).send({

                message: `Missing required fields: ${missingFields.join(', ')}`

            });

        }
        try {

            const existingUser = await UserService.findByEmail(userData.email);

            if (existingUser) {

                return res.status(409).send({

                    message: 'User with this email already exists.'

                });

            }

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

    async updateUser(req, res) {

    const targetUserId = req.params.id;

    const updateData = req.body;

   


    try {

      



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

