const VehicleService = require('../models/vehicle.service');
class VehicleController {
    async getAllVehicles(req, res) {
        try {
            // Use the unscoped service method to get all vehicles
            const vehicles = await VehicleService.findAll(); 
            res.status(200).json(vehicles);
        } catch (error) {
            console.error('Error retrieving vehicles:', error);
            res.status(500).json({ message: 'Failed to retrieve vehicles.' });
        }
    }
    async createVehicle(req, res) {
        const vehicleData = req.body;
        
        try {
            const result = await VehicleService.create(vehicleData);
            res.status(201).json({ 
                message: 'Vehicle added successfully.', 
                vehicleId: result.vehicleId 
            });
        } catch (error) {
            console.error('Error adding vehicle:', error);
            res.status(500).json({ message: 'Failed to add vehicle due to internal error.' });
        }
    }
    async updateVehicle(req, res) {
        const { id } = req.params;
        const updateData = req.body;
        
        try {
            const result = await VehicleService.update(id, updateData);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Vehicle not found or no changes made.' });
            }
            res.status(200).json({ message: 'Vehicle updated successfully.' });
        } catch (error) {
            console.error('Error updating vehicle:', error);
            res.status(500).json({ message: 'Internal error during vehicle update.' });
        }
    }
    async deleteVehicle(req, res) {
        const { id } = req.params;
        
        try {
            const result = await VehicleService.hardDelete(id); 
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Vehicle not found.' });
            }
            res.status(200).json({ message: 'Vehicle deleted permanently.' });
        } catch (error) {
            console.error('Error during vehicle hard deletion:', error);
            res.status(500).json({ message: 'Internal error during vehicle deletion.' });
        }
    }
}
module.exports = new VehicleController();
