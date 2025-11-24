const ChecklistService = require('../models/checklist.service');
const { DatabaseError } = require('mysql2');
class ChecklistController {
    async createChecklist(req, res) {
        try {
            const result = await ChecklistService.create(req.body);
            res.status(201).json({ 
                message: 'Checklist created successfully.', 
                templateId: result.templateId 
            });
        } catch (error) {
            console.error('Error creating checklist:', error);
            
            // Check for specific validation errors thrown by the factory
            if (error.message && error.message.startsWith("Validation Error")) {
                return res.status(400).json({ message: error.message });
            }
            
            res.status(500).json({ message: 'Failed to create checklist due to internal error.' });
        }
    }
    async getAllChecklists(req, res) {
        try {
            const checklists = await ChecklistService.findAll(); 
            res.status(200).json(checklists);
        } catch (error) {
            console.error('Error retrieving checklists:', error);
            res.status(500).json({ message: 'Failed to retrieve checklists.' });
        }
    }
    async getChecklistById(req, res) {
        const { id } = req.params;
        try {
            const checklist = await ChecklistService.findById(id);
            if (!checklist) {
                return res.status(404).json({ message: 'Checklist template not found.' });
            }
            res.status(200).json(checklist);
        } catch (error) {
            console.error(`Error retrieving checklist ${id}:`, error);
            res.status(500).json({ message: 'Failed to retrieve checklist.' });
        }
    }
    async updateChecklist(req, res) {
        const { id } = req.params;
        try {
            const result = await ChecklistService.update(id, req.body);
            if (result.affectedRows === 0) {
                // Returns 0 if ID is not found, or if the header data had no changes
                // Since update involves multiple tables, checking templateResult is better for 404
                // For simplicity, we'll return 200 if the transaction succeeded.
                return res.status(404).json({ message: 'Checklist not found or no header changes made.' });
            }
            res.status(200).json({ message: 'Checklist updated successfully.' });
        } catch (error) {
            console.error(`Error updating checklist ${id}:`, error);
            res.status(500).json({ message: 'Internal error during checklist update.' });
        }
    }
    async deleteChecklist(req, res) {
        const { id } = req.params;
        try {
            const result = await ChecklistService.hardDelete(id); 
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Checklist not found.' });
            }
            // ON DELETE CASCADE handled the items 
            res.status(200).json({ message: 'Checklist deleted permanently.' });
        } catch (error) {
            console.error('Error during checklist hard deletion:', error);
            res.status(500).json({ message: 'Internal error during checklist deletion.' });
        }
    }
}
module.exports = new ChecklistController();