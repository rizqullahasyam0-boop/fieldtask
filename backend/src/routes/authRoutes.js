const express = require('express');
const router = express.Router();
const { register, login, getTechnicians } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Endpoint untuk daftar (Register)
router.post('/register', register);

// Endpoint untuk masuk (Login)
router.post('/login', login);

// Endpoint untuk ambil daftar teknisi (Butuh Login)
router.get('/technicians', verifyToken, getTechnicians);

module.exports = router;