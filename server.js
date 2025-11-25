require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

const db = require('./config/db');

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Importar SOLO rutas básicas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
// const workerRoutes = require('./routes/workerRoutes'); // COMENTADO
// const taskRoutes = require('./routes/taskRoutes');    // COMENTADO

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ 
        message: '✅ Backend DonFrio funcionando!',
        version: '1.0',
        status: 'Conectado a MySQL',
        endpoints: {
            auth: '/api/auth/login',
            users: '/api/users',
            workers: '/api/workers (temporal)',
            tasks: '/api/tasks (temporal)'
        }
    });
});

// Usar rutas básicas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Rutas temporales
app.use('/api/workers', (req, res) => {
    res.json({ 
        message: '🛠️ Ruta de workers - En mantenimiento',
        note: 'El backend está funcionando correctamente'
    });
});

app.use('/api/tasks', (req, res) => {
    res.json({ 
        message: '📋 Ruta de tasks - En mantenimiento', 
        note: 'El backend está funcionando correctamente'
    });
});

// Manejar rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// INICIAR SERVIDOR
db.connect()
    .then(() => {
        console.log('✅ Conectado a MySQL - Base de datos:', process.env.DB_NAME);
        
        app.listen(port, () => {
            console.log(`🚀 Servidor DonFrio en http://localhost:${port}`);
            console.log(`📱 Listo para React Native + Expo`);
            console.log(`🔧 Nota: Worker y Task routes están temporalmente deshabilitadas`);
        });
    })
    .catch(err => {
        console.error('❌ Error base de datos:', err);
        process.exit(1);
    });