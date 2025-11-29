const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root', 
  password: process.env.DB_PASSWORD || '',  // ← Si no tienes contraseña, déjalo vacío
  database: process.env.DB_NAME || 'bd_tareasdonfrio',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err.message);
    console.log('🔧 Configuración usada:');
    console.log('   - Host:', process.env.DB_HOST || 'localhost');
    console.log('   - User:', process.env.DB_USER || 'root');
    console.log('   - Database:', process.env.DB_NAME || 'bd_tareasdonfrio');
    return;
  }
  console.log('✅ Conectado a la base de datos MySQL');
  connection.release();
});

module.exports = promisePool;