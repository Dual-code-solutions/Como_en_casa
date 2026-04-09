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
