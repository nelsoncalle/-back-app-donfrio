const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Ruta de prueba básica
app.get('/', (req, res) => {
  res.json({ message: '✅ API funcionando!' });
});

// Rutas básicas sin autenticación
app.get('/api/workers', (req, res) => {
  res.json([{ id: 1, name: 'Worker de prueba' }]);
});

app.get('/api/tasks', (req, res) => {
  res.json([{ id: 1, title: 'Tarea de prueba' }]);
});

app.listen(3001, () => {
  console.log('🚀 Servidor en http://localhost:3001');
});