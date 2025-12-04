const express = require('express');
const router = express.Router();

// Verifica que el archivo exista y exporte correctamente
const workerController = require('../controllers/workerController');

// Ruta POST para crear trabajador - VERIFICA QUE createWorker EXISTA
router.post('/', workerController.createWorker);

// Ruta GET para obtener todos los trabajadores
router.get('/', workerController.getWorkers);

// Ruta GET para obtener un trabajador por ID
router.get('/:id', workerController.getWorkerById);

// Ruta PUT para actualizar trabajador
router.put('/:id', workerController.updateWorker);

// Ruta DELETE para eliminar trabajador (cambiar estado)
router.delete('/:id', workerController.deleteWorker);

module.exports = router;