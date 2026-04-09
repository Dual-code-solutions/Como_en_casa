// src/api/middlewares/authMiddleware.js
// ─────────────────────────────────────────────────────
// Middleware de Autenticación
// Verifica el JWT del header Authorization y adjunta
// los datos del usuario al request para uso posterior.
// Se usa en todos los endpoints 🔴 dueño y 🟡 admin.
// ─────────────────────────────────────────────────────

const jwt = require('jsonwebtoken');
const logger = require('../../infrastructure/logger/logger');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (process.env.NODE_ENV !== 'production') {
      req.userId = 'mock-dev';
      req.userRole = 'dueño'; // Dar permisos amplios en dev sin login
      req.userLocalId = '02ef18a9-62aa-4fcd-98ee-1134e4aaf197';
      return next();
    }
    return res.status(401).json({
      success: false,
      error: 'Token de autenticación requerido'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adjuntar datos del usuario al request
    req.userId      = decoded.userId;
    req.userRole    = decoded.rol;
    req.userLocalId = decoded.localId;
    req.userName    = decoded.nombre;

    next();
  } catch (err) {
    logger.warn('Token inválido o expirado', {
      error: err.message,
      ip: req.ip
    });

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado. Inicia sesión nuevamente.'
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
  }
}

module.exports = authMiddleware;
