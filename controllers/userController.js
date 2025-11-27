const bcrypt = require('bcryptjs');
const db = require('../config/db');

const userController = {
  // Crear usuario (solo superuser)
  createUser: async (req, res) => {
    try {
      const { username, password, email, role = 'normal_user' } = req.body;

      // ✅ VERIFICAR QUE SEA SUPERUSUARIO
      if (req.user.role !== 'superuser') {
        return res.status(403).json({ 
          success: false,
          error: 'Solo los superusuarios pueden crear usuarios' 
        });
      }

      if (!username || !password) {
        return res.status(400).json({ 
          success: false,
          error: 'Usuario y contraseña son requeridos' 
        });
      }

      // Verificar si el usuario ya existe
      const checkQuery = 'SELECT id FROM users WHERE username = ? OR email = ?';
      const [existingUsers] = await db.execute(checkQuery, [username, email]);
      
      if (existingUsers.length > 0) {
        return res.status(400).json({ 
          success: false,
          error: 'El usuario o email ya está registrado' 
        });
      }

      // Hash de la contraseña
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Insertar nuevo usuario
      const insertQuery = `
        INSERT INTO users (username, password_hash, email, role) 
        VALUES (?, ?, ?, ?)
      `;
      
      const [result] = await db.execute(
        insertQuery, 
        [username, passwordHash, email, role]
      );

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        user: {
          id: result.insertId,
          username,
          email,
          role
        }
      });

    } catch (error) {
      console.error('Error creando usuario:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ 
          success: false,
          error: 'El usuario o email ya está registrado' 
        });
      }
      
      res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  },

  // Obtener todos los usuarios (solo superuser)
  getUsers: async (req, res) => {
    try {
      // ✅ VERIFICAR QUE SEA SUPERUSUARIO
      if (req.user.role !== 'superuser') {
        return res.status(403).json({ 
          success: false,
          error: 'No tienes permisos para ver usuarios' 
        });
      }

      const query = `
        SELECT id, username, email, role, created_at, updated_at 
        FROM users 
        ORDER BY username ASC
      `;
      
      const [users] = await db.execute(query);
      
      res.json({
        success: true,
        message: 'Usuarios obtenidos exitosamente',
        users
      });
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  },

  // Obtener usuario por ID
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Solo superusers pueden ver otros usuarios, usuarios normales solo pueden verse a sí mismos
      if (req.user.role !== 'superuser' && req.user.id !== parseInt(id)) {
        return res.status(403).json({ 
          success: false,
          error: 'No tienes permisos para ver este usuario' 
        });
      }

      const query = `
        SELECT id, username, email, role, created_at, updated_at 
        FROM users 
        WHERE id = ?
      `;
      
      const [users] = await db.execute(query, [id]);
      
      if (users.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'Usuario no encontrado' 
        });
      }
      
      res.json({
        success: true,
        message: 'Usuario obtenido exitosamente',
        user: users[0]
      });
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  },

  // Actualizar usuario
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { username, email, role } = req.body;

      // Solo superusers pueden actualizar otros usuarios
      if (req.user.role !== 'superuser' && req.user.id !== parseInt(id)) {
        return res.status(403).json({ 
          success: false,
          error: 'No tienes permisos para actualizar este usuario' 
        });
      }

      const updateQuery = `
        UPDATE users 
        SET username = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      
      await db.execute(updateQuery, [username, email, role, id]);

      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  },

  // Eliminar usuario (solo superuser)
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      if (req.user.role !== 'superuser') {
        return res.status(403).json({ 
          success: false,
          error: 'Solo los superusuarios pueden eliminar usuarios' 
        });
      }

      // No permitir eliminarse a sí mismo
      if (req.user.id === parseInt(id)) {
        return res.status(400).json({ 
          success: false,
          error: 'No puedes eliminar tu propio usuario' 
        });
      }

      const deleteQuery = 'DELETE FROM users WHERE id = ?';
      await db.execute(deleteQuery, [id]);

      res.json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  }
};

module.exports = userController;