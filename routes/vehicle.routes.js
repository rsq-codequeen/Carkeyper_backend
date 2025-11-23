const express = require('express');
const router = express.Router();
const VehicleController = require('../controllers/vehicle.controller');
const authMiddleware = require('../middleware/authJwt');

router.use(authMiddleware.verifyToken);
router.get('/', VehicleController.getAllVehicles);
router.post('/', VehicleController.createVehicle);
router.put('/:id', VehicleController.updateVehicle);
router.delete('/:id', VehicleController.deleteVehicle);
module.exports = router;