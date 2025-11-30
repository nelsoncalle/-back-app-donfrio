const express = require('express');
const cors = require('cors');

// ✅ IMPORTAR RUTAS
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const workerRoutes = require('./routes/workerRoutes');
const taskRoutes = require('./routes/taskRoutes');

// ✅ INICIALIZAR APP PRIMERO
const app = express();

// ✅ CONFIGURAR MIDDLEWARES
app.use(cors({
    origin: ['http://localhost:8081', 'exp://192.168.1.27:8081', 'http://192.168.1.27:8081'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

// ✅ LOGGING DE PETICIONES (DESPUÉS de inicializar app)
app.use((req, res, next) => {
  console.log('📥 Petición recibida:', {
    method: req.method,
    url: req.url,
    body: req.body,
    time: new Date().toLocaleTimeString()
  });
  next();
});

// ✅ RUTAS DE PRUEBA
app.get('/', (req, res) => {
  res.json({ message: '✅ API funcionando!' });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: '✅ Backend conectado correctamente',
    timestamp: new Date(),
    status: 'online'
  });
});

// ✅ USAR RUTAS
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/tareas', taskRoutes);

// ✅ INICIAR SERVIDOR
app.listen(3001, '0.0.0.0', () => {
  console.log('🚀 Servidor en http://localhost:3001');
  console.log('📱 Accesible desde: http://192.168.1.27:3001');
  console.log('🔍 Test: http://192.168.1.27:3001/api/test');
  console.log('📝 Tareas: http://192.168.1.27:3001/api/tareas');
  console.log('✅ Conectado a la base de datos MySQL');
});