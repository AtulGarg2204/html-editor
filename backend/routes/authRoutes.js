const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Register a new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get current user
router.get('/me', protect, getMe);

module.exports = router;