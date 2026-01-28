const express = require('express');
const router = express.Router();
const intakeController = require('../controllers/intake.controller');
const { verifyToken } = require('../middleware/authJwt'); // Protect it like your user routes

router.post('/', [verifyToken], intakeController.createIntake);
router.get('/', [verifyToken], intakeController.getAllIntakes);
router.put('/release/:id', intakeController.releaseVehicle);
router.get('/history/:vehicle_id', intakeController.getVehicleHistory);
module.exports = router;