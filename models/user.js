const db = require('../config/db');

class User {
    static async findByUsername(username) {
        const pool = await db.getDB();
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ?', 
            [username]
        );
        return rows[0];
    }
    
    static async create(userData) {
        const pool = await db.getDB();
        const [result] = await pool.execute(
            'INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)',
            [userData.username, userData.password_hash, userData.email, userData.role]
        );
        return result;
    }
}

module.exports = User;