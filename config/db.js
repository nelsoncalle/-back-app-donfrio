const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '', // ¡Asegúrate de que esto venga de .env!
    database: process.env.DB_NAME || 'bd_tareasdonfrio',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;

async function connectDB() {
    try {
        pool = mysql.createPool(dbConfig);
        const connection = await pool.getConnection();
        console.log('Conexión a la base de datos MySQL establecida correctamente!');
        connection.release(); // Libera la conexión de prueba
        return pool; // Devuelve el pool de conexiones
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error.message);
        throw error; // Propaga el error para que server.js pueda manejarlo
    }
}

function getDB() {
    if (!pool) {
        throw new Error('El pool de conexiones no ha sido inicializado. Llama a connectDB primero.');
    }
    return pool;
}

module.exports = {
    connect: connectDB,
    getDB: getDB
};