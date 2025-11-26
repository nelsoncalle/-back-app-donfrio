const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const authController = {
  // Login de usuario
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      console.log('Intento de login para usuario:', username);

      if (!username || !password) {
        return res.status(400).json({ 
          success: false,
          error: 'Usuario y contraseña son requeridos' 
        });
      }

      // Buscar usuario
      const query = 'SELECT * FROM users WHERE username = ?';
      const [users] = await db.execute(query, [username]);
      
      if (users.length === 0) {
        return res.status(401).json({ 
          success: false,
          error: 'Usuario o contraseña incorrectos' 
        });
      }

      const user = users[0];
      console.log('Usuario encontrado:', user.username);

      // Verificar contraseña - maneja tanto texto plano como hash
      let validPassword = false;
      
      // Si la contraseña en BD está hasheada (comienza con $2a$)
      if (user.password_hash.startsWith('$2a$')) {
        validPassword = await bcrypt.compare(password, user.password_hash);
      } else {
        // Si está en texto plano (para usuarios creados manualmente)
        validPassword = password === user.password_hash;
      }

      if (!validPassword) {
        return res.status(401).json({ 
          success: false,
          error: 'Usuario o contraseña incorrectos' 
        });
      }

      // Generar token JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET || 'supersecretkey',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login exitoso',
        token: token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  },

  // Registrar nuevo usuario (solo para superusuarios)
  register: async (req, res) => {
    try {
      const { username, password, email, role = 'normal_user' } = req.body;

      // Verificar que el usuario que hace la petición sea superuser
      if (req.user.role !== 'superuser') {
        return res.status(403).json({ 
          success: false,
          error: 'No tienes permisos para crear usuarios' 
        });
      }

      if (!username || !password) {
        return res.status(400).json({ 
          success: false,
          error: 'Usuario y contraseña son requeridos' 
        });
      }

      // Verificar si el usuario ya existe
      const checkUserQuery = 'SELECT id FROM users WHERE username = ? OR email = ?';
      const [existingUsers] = await db.execute(checkUserQuery, [username, email]);
      
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
        message: 'Usuario registrado exitosamente',
        user: {
          id: result.insertId,
          username,
          email,
          role
        }
      });

    } catch (error) {
      console.error('Error en registro:', error);
      
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

  // Verificar token (para el frontend)
  verifyToken: async (req, res) => {
    try {
      // Si llegó aquí, el middleware ya verificó el token
      res.json({
        success: true,
        message: 'Token válido',
        user: req.user
      });
    } catch (error) {
      console.error('Error verificando token:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor' 
      });
    }
  },

  // Obtener perfil de usuario
  getProfile: async (req, res) => {
    try {
      const query = 'SELECT id, username, email, role, created_at FROM users WHERE id = ?';
      const [users] = await db.execute(query, [req.user.id]);
      
      if (users.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'Usuario no encontrado' 
        });
      }

      res.json({
        success: true,
        user: users[0]
      });
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor' 
      });
    }
  }
};

module.exports = authController;