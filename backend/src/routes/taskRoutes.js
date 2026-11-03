const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTaskStatus } = require('../controllers/taskController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// Semua route di bawah ini WAJIB login (pakai token)
router.use(verifyToken);

router.post('/', isAdmin, createTask); // Cuma admin yg bisa bikin
router.get('/', getTasks);             // Admin & teknisi bisa liat
router.patch('/:id/status', updateTaskStatus); // Update status

module.exports = router;