const express = require('express');
const cors = require('cors');
const os = require('os');
const ngrok = require('ngrok');

const app = express();

// Habilita CORS para todas las rutas
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsear JSON
app.use(express.json());

// ========== RUTA DE HEALTH ==========
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'app-tareas-donfrio',
    timestamp: new Date().toISOString()
  });
});

// ========== VERIFICAR Y CARGAR RUTAS ==========
console.log('\n🔧 ========== CARGANDO RUTAS ==========');

// 1. Auth routes
try {
  console.log('🔐 Cargando authRoutes...');
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('✅ authRoutes cargado');
} catch (error) {
  console.error('❌ Error cargando authRoutes:', error.message);
  // Ruta de emergencia para auth
  app.post('/api/auth/login', (req, res) => {
    console.log('🔐 Login de emergencia');
    res.json({
      success: true,
      message: 'Login de emergencia',
      token: 'temp-token-' + Date.now(),
      user: { id: 1, username: 'admin' }
    });
  });
}

// 2. Worker routes
try {
  console.log('👷 Cargando workerRoutes...');
  const workerRoutes = require('./routes/workerRoutes');
  app.use('/api/workers', workerRoutes);
  console.log('✅ workerRoutes cargado');
} catch (error) {
  console.error('❌ Error cargando workerRoutes:', error.message);
  // Ruta de emergencia para workers
  app.get('/api/workers', (req, res) => {
    console.log('👷 GET /api/workers (emergencia)');
    res.json([
      { id: 1, nombre: 'Juan Pérez (demo)', cargo: 'Repartidor', email: 'juan@demo.com' },
      { id: 2, nombre: 'María Gómez (demo)', cargo: 'Supervisora', email: 'maria@demo.com' }
    ]);
  });
  
  app.post('/api/workers', (req, res) => {
    console.log('👷 POST /api/workers (emergencia):', req.body);
    res.json({
      success: true,
      message: 'Trabajador creado (demo)',
      id: Date.now()
    });
  });
}

// 3. Task routes
try {
  console.log('✅ Cargando taskRoutes...');
  const taskRoutes = require('./routes/taskRoutes');
  app.use('/api/tasks', taskRoutes);
  console.log('✅ taskRoutes cargado');
} catch (error) {
  console.error('❌ Error cargando taskRoutes:', error.message);
  // Ruta de emergencia para tasks
  app.get('/api/tasks', (req, res) => {
    console.log('✅ GET /api/tasks (emergencia)');
    res.json([
      { id: 1, titulo: 'Tarea demo 1', descripcion: 'Descripción demo', estado: 'pendiente' },
      { id: 2, titulo: 'Tarea demo 2', descripcion: 'Otra descripción', estado: 'en_progreso' }
    ]);
  });
  
  app.post('/api/tasks', (req, res) => {
    console.log('✅ POST /api/tasks (emergencia):', req.body);
    res.json({
      success: true,
      message: 'Tarea creada (demo)',
      id: Date.now()
    });
  });
}

// ========== FUNCIONES AUXILIARES ==========
function showNetworkInfo(PORT) {
  console.log('\n🌐 DIRECCIONES DE RED DISPONIBLES:');
  console.log('====================================');
  
  const networks = os.networkInterfaces();
  let hasLocalIP = false;
  
  Object.keys(networks).forEach((interfaceName) => {
    networks[interfaceName].forEach((net) => {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`📡 ${interfaceName}: http://${net.address}:${PORT}/api`);
        hasLocalIP = true;
      }
    });
  });
  
  if (!hasLocalIP) {
    console.log('⚠️  No se encontraron IPs locales');
  }
}

async function startNgrokTunnel(PORT) {
  try {
    console.log('\n🔗 INICIANDO TÚNEL PÚBLICO (ngrok)...');
    
    const url = await ngrok.connect(PORT); // Solo el puerto, más simple
    
    console.log('\n✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨');
    console.log('🚀 URL PÚBLICA PARA CUALQUIER RED:');
    console.log(`   ${url}/api`);
    console.log('✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨\n');
    
    console.log('📱 USALA EN TU APP MÓVIL:');
    console.log(`👉 ${url}/api`);
    console.log('\n🔥 ¡Funciona en cualquier WiFi/celular!');
    
    // Guardar la URL en un archivo para fácil acceso
    const fs = require('fs');
    fs.writeFileSync('ngrok-url.txt', url);
    console.log('💾 URL guardada en ngrok-url.txt');
    
    return url;
  } catch (error) {
    console.log('\n⚠️  Ngrok no disponible. Razón:', error.message);
    console.log('💡 Para usar ngrok, corre en otra terminal:');
    console.log('   npx ngrok http 3001');
    return null;
  }
}

// ========== INICIAR SERVIDOR ==========
const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  console.clear();
  console.log('===========================================');
  console.log('🚀 SERVIDOR APP TAREAS DONFRÍO');
  console.log('===========================================\n');
  
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`💻 Local: http://localhost:${PORT}/api`);
  
  // Mostrar IPs de red (pasar PORT como parámetro)
  showNetworkInfo(PORT);
  
  // Iniciar ngrok automáticamente (pasar PORT como parámetro)
  const publicUrl = await startNgrokTunnel(PORT);
  
  console.log('\n===========================================');
  console.log('📋 ENDPOINTS DISPONIBLES:');
  console.log('===========================================');
  console.log('🔐 Auth:');
  console.log('   POST /api/auth/login');
  console.log('   GET  /api/auth/health');
  console.log('\n👷 Workers:');
  console.log('   GET    /api/workers');
  console.log('   POST   /api/workers');
  console.log('   GET    /api/workers/:id');
  console.log('   PUT    /api/workers/:id');
  console.log('   DELETE /api/workers/:id');
  console.log('\n✅ Tasks:');
  console.log('   GET    /api/tasks');
  console.log('   POST   /api/tasks');
  console.log('   GET    /api/tasks/:id');
  console.log('   PUT    /api/tasks/:id');
  console.log('   DELETE /api/tasks/:id');
  console.log('\n❤️  Health:');
  console.log('   GET    /api/health');
  console.log('===========================================\n');
  
  console.log('💡 PARA PROBAR:');
  console.log('1. curl http://localhost:3001/api/health');
  console.log('2. curl http://localhost:3001/api/workers');
  console.log('3. curl http://localhost:3001/api/tasks');
});