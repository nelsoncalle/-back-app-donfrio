const bcrypt = require('bcrypt');
const db = require('../config/db'); // Importa la conexión a la DB

// Obtiene el pool de conexiones
async function getUserPool() {
    if (!db.getDB()) {
        await db.connect(); // Asegura que la DB esté conectada
    }
    return db.getDB();
}

exports.createUser = async (req, res) => {
    const { username, password, email, role } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username y password son requeridos.' });
    }

    try {
        const pool = await getUserPool();
        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = (role === 'superuser' || role === 'normal_user') ? role : 'normal_user';

        const [result] = await pool.execute(
            `INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)`,
            [username, hashedPassword, email, userRole]
        );

        res.status(201).json({ message: 'Usuario creado exitosamente', userId: result.insertId });

    } catch (error) {
        console.error('Error al crear usuario:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'El username o email ya está en uso.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al crear usuario.' });
    }
};

// --- Añade aquí más funciones CRUD para usuarios ---

exports.getUsers = async (req, res) => {
    try {
        const pool = await getUserPool();
        const [rows] = await pool.execute('SELECT id, username, email, role, created_at, updated_at FROM users');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener usuarios.' });
    }
};

exports.getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getUserPool();
        const [rows] = await pool.execute('SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error al obtener usuario por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener usuario.' });
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, email, role } = req.body; // No actualizar contraseña directamente aquí, hacer en otra ruta
    try {
        const pool = await getUserPool();
        const [result] = await pool.execute(
            `UPDATE users SET username = ?, email = ?, role = ?, updated_at = NOW() WHERE id = ?`,
            [username, email, role, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado para actualizar.' });
        }
        res.status(200).json({ message: 'Usuario actualizado exitosamente.' });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'El username o email ya está en uso por otro usuario.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al actualizar usuario.' });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getUserPool();
        const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado para eliminar.' });
        }
        res.status(200).json({ message: 'Usuario eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar usuario.' });
    }
};