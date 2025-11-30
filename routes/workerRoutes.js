const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');

// ✅ RUTAS BÁSICAS
router.post('/', workerController.createWorker);
router.get('/', workerController.getWorkers);
router.get('/:id', workerController.getWorkerById);
router.put('/:id', workerController.updateWorker);
router.delete('/:id', workerController.deleteWorker);

module.exports = router;