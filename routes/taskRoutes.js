// routes/taskRoutes.js - VERSIÓN SIMPLIFICADA Y SEGURA
const express = require('express');
const router = express.Router();

// Importar controlador
const taskController = require('../controllers/taskController');

// ✅ VERIFICACIÓN SEGURA: Solo usar funciones que existan
console.log('🔍 Verificando taskController...');

// 1. Ruta POST para crear tarea (ESENCIAL)
if (typeof taskController.createTask === 'function') {
  router.post('/', taskController.createTask);
  console.log('✅ POST / - createTask configurado');
} else {
  console.error('❌ ERROR CRÍTICO: taskController.createTask no es función');
  process.exit(1);
}

// 2. Ruta GET para obtener tareas (ESENCIAL)
if (typeof taskController.getTasks === 'function') {
  router.get('/', taskController.getTasks);
  console.log('✅ GET / - getTasks configurado');
} else {
  console.warn('⚠️ ADVERTENCIA: taskController.getTasks no disponible');
}

// 3. Otras rutas (OPCIONALES - pueden no existir aún)
if (typeof taskController.getTaskById === 'function') {
  router.get('/:id', taskController.getTaskById);
  console.log('✅ GET /:id - getTaskById configurado');
}

if (typeof taskController.updateTask === 'function') {
  router.put('/:id', taskController.updateTask);
  console.log('✅ PUT /:id - updateTask configurado');
}

if (typeof taskController.deleteTask === 'function') {
  router.delete('/:id', taskController.deleteTask);
  console.log('✅ DELETE /:id - deleteTask configurado');
}

console.log('🎯 Task routes configuradas exitosamente');

module.exports = router;