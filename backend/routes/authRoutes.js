const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');


// Register User
router.post('/register', authController.register);


// Login User
router.post('/login', authController.login);

// Forgot Passworda
router.post('/forgot-password', authController.forgotPassword);


module.exports = router;
