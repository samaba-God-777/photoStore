const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

// Middleware para proteger rutas (requiere JWT válido)
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Acceso no autorizado. Token requerido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado.' });
    }
    req.user = await prisma.user.update({
      where: { id: user.id },
      data: { lastSeen: new Date() },
    });
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token inválido o expirado.' });
  }
};

// Middleware para requerir rol de admin
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acceso denegado. Se requiere rol de administrador.' });
  }
  next();
};

module.exports = { protect, adminOnly };
