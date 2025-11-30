const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// ✅ SOLO LAS RUTAS MÁS BÁSICAS - SIN ERRORES
router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);


module.exports = router;