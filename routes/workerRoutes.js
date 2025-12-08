const express = require('express');
const router = express.Router();

// Verifica que el archivo exista y exporte correctamente
const workerController = require('../controllers/workerController');


router.post('/', workerController.createWorker);
router.get('/', workerController.getWorkers);





module.exports = router;