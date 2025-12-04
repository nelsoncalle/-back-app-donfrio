const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logs
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const workerRoutes = require('./routes/workerRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Usar rutas PRINCIPALES (inglés)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workers', workerRoutes);  // ✅ Principal
app.use('/api/tasks', taskRoutes);      // ✅ Principal

// ✅ ALIAS EN ESPAÑOL (para compatibilidad con frontend existente)
app.use('/api/trabajadores', workerRoutes);  // ✅ Alias
app.use('/api/tareas', taskRoutes);          // ✅ Alias

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '✅ Backend funcionando',
    timestamp: new Date().toISOString(),
    rutas: {
      trabajadores: ['/api/workers', '/api/trabajadores'],
      tareas: ['/api/tasks', '/api/tareas'],
      auth: '/api/auth'
    }
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Gestor de Tareas Donfrío',
    version: '1.0.0',
    endpoints: {
      trabajadores: ['/api/workers', '/api/trabajadores'],
      tareas: ['/api/tasks', '/api/tareas'],
      auth: '/api/auth'
    }
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    suggested: {
      trabajadores: ['/api/workers', '/api/trabajadores'],
      tareas: ['/api/tasks', '/api/tareas']
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Contacte al administrador'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 Endpoints disponibles:`);
  console.log(`   http://localhost:${PORT}/`);
  console.log(`   http://localhost:${PORT}/api/test`);
  console.log(`   http://localhost:${PORT}/api/workers (y /api/trabajadores)`);
  console.log(`   http://localhost:${PORT}/api/tasks (y /api/tareas)`);
  console.log(`   http://localhost:${PORT}/api/auth/login`);
});