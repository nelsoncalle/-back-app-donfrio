const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, taskController.createTask);
router.get('/', authenticateToken, taskController.getTasks);
router.get('/:id', authenticateToken, taskController.getTaskById);
router.put('/:id', authenticateToken, taskController.updateTask);
router.delete('/:id', authenticateToken, taskController.deleteTask);
router.get('/worker/:workerId', authenticateToken, taskController.getTasksByWorker);
router.get('/status/:status', authenticateToken, taskController.getTasksByStatus);
router.patch('/:id/status', authenticateToken, taskController.updateTaskStatus);
router.patch('/:id/image', authenticateToken, taskController.updateTaskImage);
router.get('/stats/summary', authenticateToken, taskController.getTaskStats);

module.exports = router;