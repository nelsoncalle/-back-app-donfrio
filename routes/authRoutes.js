const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/login', authController.login);

// Rutas protegidas (requieren autenticación)
router.post('/register', authenticateToken, authController.register);
router.get('/verify', authenticateToken, authController.verifyToken);
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;