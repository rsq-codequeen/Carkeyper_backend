const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/authJwt');
const { isAdmin } = require('../middleware/authRole').default;

// Routes
router.get('/', [verifyToken, isAdmin], userController.getAllUsers);
router.post('/', [verifyToken, isAdmin], userController.createUser);

// FIX: Changed authJwt to verifyToken and UserController to userController
// Only verifyToken is used here so Drivers can enter the method
router.put('/:id', [verifyToken], userController.updateUser);

router.delete('/:id', [verifyToken, isAdmin], userController.deactivateUser);
router.post('/:id/assign-vehicle', [verifyToken, isAdmin], userController.assignVehicle);
module.exports = router;