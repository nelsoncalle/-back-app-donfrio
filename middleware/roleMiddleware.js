const requireSuperuser = (req, res, next) => {
    if (req.user.role !== 'superuser') {
        return res.status(403).json({ 
            message: 'Se requieren privilegios de superusuario.' 
        });
    }
    next();
};

module.exports = { requireSuperuser };