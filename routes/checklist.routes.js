// routes/checklist.routes.js
const express = require('express');
const router = express.Router();
const ChecklistController = require('../controllers/checklist.controller');
const authMiddleware = require('../middleware/authJwt'); // Your existing auth middleware

// Apply token verification to all checklist routes
router.use(authMiddleware.verifyToken);

// Create Checklist
router.post('/checklists', ChecklistController.createChecklist);

// Read All Checklists
router.get('/checklists', ChecklistController.getAllChecklists);

// Read One Checklist (for Edit Mode)
router.get('/checklists/:id', ChecklistController.getChecklistById);

// Update Checklist
router.put('/checklists/:id', ChecklistController.updateChecklist);

// Delete Checklist
router.delete('/checklists/:id', ChecklistController.deleteChecklist);

module.exports = router;