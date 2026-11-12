const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTaskStatus, updateTask, deleteTask } = require('../controllers/taskController');
const { exportTasks } = require('../controllers/exportController'); // <-- Import Export
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.use(verifyToken);

// Route Export (WAJIB ditaruh di atas route '/:id' biar nggak bentrok)
router.get('/export', isAdmin, exportTasks); // <-- Route Baru

router.post('/', isAdmin, createTask);
router.get('/', getTasks);
router.put('/:id', isAdmin, updateTask);
router.patch('/:id/status', updateTaskStatus);
router.delete('/:id', isAdmin, deleteTask);

module.exports = router;