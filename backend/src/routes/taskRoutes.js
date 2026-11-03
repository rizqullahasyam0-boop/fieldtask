const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTaskStatus, updateTask } = require('../controllers/taskController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// Semua route di bawah ini WAJIB login (pakai token)
router.use(verifyToken);

// Route buat tugas
router.post('/', isAdmin, createTask);         // Bikin tugas baru
router.get('/', getTasks);                     // Liat daftar tugas
router.put('/:id', isAdmin, updateTask);       // Edit / Assign tugas (BARU!)
router.patch('/:id/status', updateTaskStatus); // Update status tugas

module.exports = router;