const express = require('express');
const router = express.Router();

const userController=require('../controllers/user.controller');
const {verifyToken}=require('../middleware/authJwt');
const { isAdmin } = require('../middleware/authRole').default;

router.get('/', [verifyToken, isAdmin], userController.getAllUsers);
router.post('/', [verifyToken, isAdmin], userController.createUser);
router.put('/:id', [verifyToken, isAdmin], userController.updateUser);
router.delete('/:id', [verifyToken, isAdmin], userController.deactivateUser);

module.exports = router;