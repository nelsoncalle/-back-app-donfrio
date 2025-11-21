require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

const db = require('./config/db');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const workerRoutes = require('./routes/workerRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ 
        message: 'Backend DonFrio funcionando!',
        version: '1.0',
        endpoints: {
            auth: '/api/auth/login',
            users: '/api/users',
            workers: '/api/workers', 
            tasks: '/api/tasks'
        }
    });
});

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/tasks', taskRoutes);

// Manejar rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
db.connect()
    .then(() => {
        app.listen(port, () => {
            console.log(`🚀 Servidor DonFrio en http://localhost:${port}`);
            console.log(`📱 Listo para React Native + Expo`);
        });
    })
    .catch(err => {
        console.error('❌ Error base de datos:', err);
        process.exit(1);
    });