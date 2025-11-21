const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, workerController.createWorker);
router.get('/', authenticateToken, workerController.getWorkers);
router.get('/:id', authenticateToken, workerController.getWorkerById);
router.put('/:id', authenticateToken, workerController.updateWorker);
router.delete('/:id', authenticateToken, workerController.deleteWorker);
router.get('/stats/with-tasks', authenticateToken, workerController.getWorkersWithStats);

module.exports = router;