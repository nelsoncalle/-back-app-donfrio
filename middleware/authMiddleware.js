const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const token = req.header('Authorization'); // Se espera 'Bearer TOKEN'

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    // Extraer solo el token si viene con "Bearer "
    const tokenParts = token.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Formato de token inválido. Use "Bearer [token]".' });
    }
    const jwtToken = tokenParts[1];

    try {
        const verified = jwt.verify(jwtToken, process.env.JWT_SECRET || 'supersecretkey'); // Usa la misma clave secreta que para firmar
        req.user = verified; // Guarda la información del usuario en el objeto de solicitud
        next(); // Continúa con la siguiente función del middleware/ruta
    } catch (error) {
        res.status(403).json({ message: 'Token inválido o expirado.' });
    }
};

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'No tienes permisos para realizar esta acción.' });
        }
        next();
    };
};