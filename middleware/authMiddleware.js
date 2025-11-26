const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Acceso denegado. Token requerido.' 
    });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    req.user = verified;
    next();
  } catch (error) {
    console.error('Error verificando token:', error);
    return res.status(403).json({ 
      success: false,
      message: 'Token inválido o expirado.' 
    });
  }
};

// Middleware para verificar roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: 'No tienes permisos para realizar esta acción.' 
      });
    }
    next();
  };
};

module.exports = { 
  authenticateToken, 
  authorizeRoles 
};