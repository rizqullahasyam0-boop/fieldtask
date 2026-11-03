const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Endpoint untuk daftar (Register)
router.post('/register', register);

// Endpoint untuk masuk (Login)
router.post('/login', login);

module.exports = router;