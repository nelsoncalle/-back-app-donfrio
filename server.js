require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Importar el módulo de conexión a la base de datos
const db = require('./config/db');

// Importar las rutas
const userRoutes = require('./routes/userRoutes');
// const taskRoutes = require('./routes/taskRoutes'); // Para añadir después
// const workerRoutes = require('./routes/workerRoutes'); // Para añadir después
// const authRoutes = require('./routes/authRoutes'); // Para añadir después (login/registro/token)


// Middleware para parsear JSON
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡Bienvenido al Backend de Tareas DonFrio (Node.js)!');
});

// Usar las rutas de usuario
app.use('/users', userRoutes);

// Iniciar el servidor SOLO después de conectar a la base de datos
db.connect()
    .then(() => {
        app.listen(port, () => {
            console.log(`Servidor Node.js escuchando en http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.error('Fallo al conectar a la base de datos:', err.message);
        process.exit(1); // Sale de la aplicación si no puede conectar a la DB
    });