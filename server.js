const express = require('express');
const cors = require('cors');

// ✅ IMPORTAR TODAS LAS RUTAS
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const workerRoutes = require('./routes/workerRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Ruta de prueba básica
app.get('/', (req, res) => {
  res.json({ message: '✅ API funcionando!' });
});

// ✅ USAR TODAS LAS RUTAS - INCLUYENDO USERS
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/tasks', taskRoutes);

app.listen(3001, '0.0.0.0', () => {
  console.log('🚀 Servidor en http://localhost:3001');
  console.log('📱 Accesible desde: http://172.17.60.16:3001');
});