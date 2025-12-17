const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const authController = {
  /**
   * Login de usuario - ACEPTA USERNAME O EMAIL
   */
  login: async (req, res) => {
    console.log('🔐 ========== BACKEND: LOGIN REQUEST ==========');
    
    try {
      // ACEPTAR USERNAME O EMAIL
      const { username, email, password } = req.body;
      
      console.log('📦 Body recibido:', {
        username: username || 'no proporcionado',
        email: email || 'no proporcionado',
        password: password ? '***' : 'no proporcionado'
      });
      
      // Validar que tengamos credenciales
      const identifier = username || email;
      
      if (!identifier || !password) {
        console.log('❌ ERROR: Faltan credenciales');
        return res.status(400).json({ 
          success: false,
          error: 'Usuario/Email y contraseña son requeridos' 
        });
      }
      
      console.log('🔍 Buscando usuario con identificador:', identifier);
      
      // BUSCAR USUARIO POR USERNAME O EMAIL
      const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
      console.log('   Query:', query);
      console.log('   Parámetros:', [identifier, identifier]);
      
      const [users] = await db.execute(query, [identifier, identifier]);
      
      console.log('👤 Resultados encontrados:', users.length);
      
      if (users.length === 0) {
        console.log('❌ ERROR: Usuario no encontrado');
        return res.status(401).json({ 
          success: false,
          error: 'Usuario o contraseña incorrectos' 
        });
      }
      
      const user = users[0];
      console.log('✅ Usuario encontrado:', {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        password_hash_length: user.password_hash?.length || 0
      });
      
      // VERIFICAR CONTRASEÑA
      console.log('🔑 Verificando contraseña...');
      let validPassword = false;
      
      // Detectar si la contraseña está hasheada o en texto plano
      const isHashed = user.password_hash && user.password_hash.startsWith('$2a$');
      
      console.log('   Tipo de password:', isHashed ? 'Hash bcrypt' : 'Texto plano');
      console.log('   Password en BD:', isHashed ? '*** (hasheado)' : user.password_hash);
      
      if (isHashed) {
        // Comparar hash bcrypt
        validPassword = await bcrypt.compare(password, user.password_hash);
        console.log('   Resultado comparación bcrypt:', validPassword);
      } else {
        // Comparar texto plano (para desarrollo)
        validPassword = (password === user.password_hash);
        console.log('   Resultado comparación texto plano:', validPassword);
      }
      
      if (!validPassword) {
        console.log('❌ ERROR: Contraseña incorrecta');
        return res.status(401).json({ 
          success: false,
          error: 'Usuario o contraseña incorrectos' 
        });
      }
      
      console.log('✅ Contraseña válida!');
      
      // GENERAR TOKEN JWT
      console.log('🎫 Generando token JWT...');
      
      const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };
      
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'supersecretkey_donfrio_app_2025',
        { expiresIn: '24h' }
      );
      
      console.log('✅ Token generado exitosamente');
      console.log('   Payload:', payload);
      console.log('   Token (primeros 20 chars):', token.substring(0, 20) + '...');
      
      // RESPUESTA EXITOSA
      console.log('📤 Enviando respuesta exitosa...');
      
      const response = {
        success: true,
        message: 'Login exitoso',
        token: token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      };
      
      console.log('🔐 ========== BACKEND: LOGIN EXITOSO ==========');
      res.json(response);
      
    } catch (error) {
      console.error('🔥 ERROR CRÍTICO en login:', error);
      console.error('   Stack:', error.stack);
      
      res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Registrar nuevo usuario (solo para superusuarios)
   */
  register: async (req, res) => {
    console.log('📝 ========== BACKEND: REGISTER ==========');
    
    try {
      const { username, password, email, role = 'normal_user' } = req.body;
      
      console.log('📦 Datos de registro:', {
        username,
        email,
        role,
        password: password ? '***' : 'no proporcionado'
      });
      
      // Verificar permisos (solo superuser puede crear usuarios)
      if (req.user && req.user.role !== 'superuser') {
        console.log('❌ ERROR: Usuario no tiene permisos');
        return res.status(403).json({ 
          success: false,
          error: 'No tienes permisos para crear usuarios' 
        });
      }
      
      if (!username || !password) {
        console.log('❌ ERROR: Faltan datos obligatorios');
        return res.status(400).json({ 
          success: false,
          error: 'Usuario y contraseña son requeridos' 
        });
      }
      
      // Verificar si el usuario ya existe
      const checkQuery = 'SELECT id FROM users WHERE username = ? OR email = ?';
      const [existingUsers] = await db.execute(checkQuery, [username, email]);
      
      if (existingUsers.length > 0) {
        console.log('❌ ERROR: Usuario o email ya registrado');
        return res.status(400).json({ 
          success: false,
          error: 'El usuario o email ya está registrado' 
        });
      }
      
      // Hash de la contraseña
      console.log('🔐 Hasheando contraseña...');
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      // Insertar nuevo usuario
      const insertQuery = `
        INSERT INTO users (username, password_hash, email, role) 
        VALUES (?, ?, ?, ?)
      `;
      
      console.log('💾 Insertando usuario en BD...');
      const [result] = await db.execute(
        insertQuery, 
        [username, passwordHash, email, role]
      );
      
      console.log('✅ Usuario registrado exitosamente. ID:', result.insertId);
      
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
      
      console.log('📝 ========== BACKEND: REGISTER EXITOSO ==========');
      
    } catch (error) {
      console.error('🔥 ERROR en registro:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ 
          success: false,
          error: 'El usuario o email ya está registrado' 
        });
      }
      
      res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Verificar token (para el frontend)
   */
  verifyToken: async (req, res) => {
    console.log('🔍 ========== BACKEND: VERIFY TOKEN ==========');
    
    try {
      // Si llegó aquí, el middleware ya verificó el token
      console.log('✅ Token válido para usuario:', req.user);
      
      res.json({
        success: true,
        message: 'Token válido',
        user: req.user
      });
      
      console.log('🔍 ========== BACKEND: TOKEN VERIFICADO ==========');
      
    } catch (error) {
      console.error('🔥 ERROR verificando token:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor' 
      });
    }
  },

  /**
   * Obtener perfil de usuario
   */
  getProfile: async (req, res) => {
    console.log('👤 ========== BACKEND: GET PROFILE ==========');
    
    try {
      const userId = req.user.id;
      console.log('🔍 Obteniendo perfil para usuario ID:', userId);
      
      const query = 'SELECT id, username, email, role, created_at FROM users WHERE id = ?';
      const [users] = await db.execute(query, [userId]);
      
      if (users.length === 0) {
        console.log('❌ ERROR: Usuario no encontrado');
        return res.status(404).json({ 
          success: false,
          error: 'Usuario no encontrado' 
        });
      }
      
      const user = users[0];
      console.log('✅ Perfil obtenido:', user);
      
      res.json({
        success: true,
        user: user
      });
      
      console.log('👤 ========== BACKEND: PROFILE OK ==========');
      
    } catch (error) {
      console.error('🔥 ERROR obteniendo perfil:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor' 
      });
    }
  },

  /**
   * Logout
   */
  logout: async (req, res) => {
    console.log('🚪 ========== BACKEND: LOGOUT ==========');
    console.log('👤 Usuario haciendo logout:', req.user?.username);
    
    // En JWT no hay mucho que hacer en el backend, el token se invalida en el frontend
    res.json({
      success: true,
      message: 'Logout exitoso'
    });
    
    console.log('🚪 ========== BACKEND: LOGOUT COMPLETO ==========');
  },

  /**
   * Endpoint de salud para verificar que el auth está funcionando
   */
  healthCheck: async (req, res) => {
    console.log('❤️ ========== BACKEND: AUTH HEALTH CHECK ==========');
    
    try {
      // Verificar conexión a la BD
      const [result] = await db.execute('SELECT COUNT(*) as user_count FROM users');
      const userCount = result[0].user_count;
      
      console.log('✅ Auth health check OK');
      console.log('   Usuarios en BD:', userCount);
      
      res.json({
        success: true,
        service: 'auth-service',
        status: 'healthy',
        database: 'connected',
        user_count: userCount,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Auth health check FAILED:', error);
      res.status(500).json({
        success: false,
        service: 'auth-service',
        status: 'unhealthy',
        error: error.message
      });
    }
  }
};

module.exports = authController;