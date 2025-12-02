const express = require('express');
const cors = require('cors');

// ✅ IMPORTAR RUTAS
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const workerRoutes = require('./routes/workerRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// ✅ CONFIGURAR CORS PARA EXPO
app.use(cors({
    origin: ['http://localhost:8081', 'exp://192.168.1.27:8081', 'http://192.168.1.27:8081'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

// ✅ LOGGING DETALLADO
app.use((req, res, next) => {
  console.log(`\n📥 ${req.method} ${req.url}`);
  console.log('📦 Body:', req.body);
  console.log('🔧 Headers:', req.headers);
  next();
});

// ✅ RUTA DE PRUEBA MEJORADA
app.get('/api/test', (req, res) => {
  const db = require('./config/db');
  db.query('SELECT 1 + 1 AS result')
    .then(([results]) => {
      res.json({ 
        success: true,
        message: '✅ Backend funcionando',
        database: '✅ MySQL conectado',
        result: results[0].result,
        timestamp: new Date().toISOString()
      });
    })
    .catch(err => {
      console.error('❌ Error en BD:', err);
      res.status(500).json({ 
        success: false,
        error: 'Error en conexión a BD',
        details: err.message 
      });
    });
});

// ✅ RUTA PARA VERIFICAR TABLAS
app.get('/api/db-check', (req, res) => {
  const db = require('./config/db');
  
  db.query('SHOW TABLES')
    .then(([tables]) => {
      const tableNames = tables.map(row => Object.values(row)[0]);
      res.json({
        success: true,
        tables: tableNames,
        count: tableNames.length
      });
    })
    .catch(err => {
      res.status(500).json({ 
        success: false,
        error: 'Error obteniendo tablas',
        details: err.message 
      });
    });
});

// ✅ USAR RUTAS
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/tareas', taskRoutes);

// ✅ MANEJO DE ERRORES
app.use((err, req, res, next) => {
  console.error('🔥 Error no manejado:', err);
  res.status(500).json({ 
    success: false,
    error: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ✅ RUTA NO ENCONTRADA
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Ruta no encontrada: ' + req.originalUrl 
  });
});

// ✅ INICIAR SERVIDOR
const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 =================================');
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 URL: http://192.168.1.27:${PORT}`);
  console.log('📊 Para probar:');
  console.log(`   • http://192.168.1.27:${PORT}/api/test`);
  console.log(`   • http://192.168.1.27:${PORT}/api/db-check`);
  console.log('=================================\n');
});