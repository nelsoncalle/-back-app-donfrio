const express = require('express');
const cors = require('cors');

const app = express();

// Habilita CORS para todas las rutas
app.use(cors({
  origin: '*', // Permite todos los orígenes
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsear JSON
app.use(express.json());

// Tus rutas aquí...
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/workers', require('./routes/workerRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// Puerto
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Accesible en: http://localhost:${PORT}`);
  console.log(`📱 Desde tu teléfono: http://192.168.1.27:${PORT}`);
});