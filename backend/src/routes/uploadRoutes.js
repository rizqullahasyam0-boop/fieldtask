const express = require('express');
const router = express.Router();
const { uploadAttachment } = require('../controllers/uploadController');
const { verifyToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Endpoint: POST /api/upload/:id
// upload.single('photo') -> nama field form-data-nya harus 'photo'
router.post('/:id', verifyToken, upload.single('photo'), uploadAttachment);

module.exports = router;