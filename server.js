const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

// ✅ CONEXIÓN A LA BASE DE DATOS SIN CONTRASEÑA
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bd_tareasdonfrio'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Error conectando a la base de datos:', err);
        return;
    }
    console.log('✅ Conectado a la base de datos MySQL');
});

// ✅ IMPORTAR RUTAS
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const workerRoutes = require('./routes/workerRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// ✅ CONFIGURAR CORS
app.use(cors({
    origin: ['http://localhost:8081', 'exp://192.168.1.27:8081', 'http://192.168.1.27:8081'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

// ✅ LOGGING SIMPLE
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// ✅ RUTA DE PRUEBA
app.get('/api/test', (req, res) => {
  db.query('SELECT 1 + 1 AS result', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error en BD' });
    }
    res.json({ 
      message: '✅ Backend funcionando',
      database: '✅ MySQL OK',
      result: results[0].result
    });
  });
});

// ✅ USAR RUTAS
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/tareas', taskRoutes);

// ✅ INICIAR SERVIDOR
const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Servidor en puerto 3001');
});