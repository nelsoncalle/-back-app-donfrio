const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Asegúrate de que el pool esté disponible
async function getAuthPool() {
    if (!db.getDB()) {
        await db.connect();
    }
    return db.getDB();
}

exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username y password son requeridos.' });
    }

    try {
        const pool = await getAuthPool();
        const [rows] = await pool.execute('SELECT id, username, password_hash, role FROM users WHERE username = ?', [username]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // Generar JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'supersecretkey', // ¡Usa una clave secreta fuerte de .env!
            { expiresIn: '1h' } // El token expira en 1 hora
        );

        res.status(200).json({ message: 'Login exitoso', token, role: user.role });

    } catch (error) {
        console.error('Error durante el login:', error);
        res.status(500).json({ message: 'Error interno del servidor durante el login.' });
    }
};