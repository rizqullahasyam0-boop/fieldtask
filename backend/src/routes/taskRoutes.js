const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTaskStatus, updateTask, deleteTask } = require('../controllers/taskController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.post('/', isAdmin, createTask);
router.get('/', getTasks);
router.put('/:id', isAdmin, updateTask);
router.patch('/:id/status', updateTaskStatus);
router.delete('/:id', isAdmin, deleteTask); // <-- Route Hapus (Cuma Admin)

module.exports = router;