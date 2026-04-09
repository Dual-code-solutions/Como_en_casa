// src/api/middlewares/errorMiddleware.js
// ─────────────────────────────────────────────────────
// Middleware Central de Errores
// SIEMPRE se monta al final de la cadena de middlewares.
// Captura todos los errores con next(error) y responde
// con un formato consistente.
//
// En producción oculta detalles internos.
// En desarrollo muestra el mensaje completo + stack.
// ─────────────────────────────────────────────────────

const logger = require('../../infrastructure/logger/logger');

function errorMiddleware(err, req, res, next) {
  // Registrar el error
  logger.error('Request error', {
    message:  err.message,
    stack:    process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    url:      req.originalUrl,
    method:   req.method,
    userId:   req.userId || 'anónimo',
    body:     process.env.NODE_ENV !== 'production' ? req.body : undefined
  });

  // Errores de negocio (lanzados manualmente en use cases)
  if (err.message.includes('no encontrad') ||
      err.message.includes('no existe') ||
      err.message.includes('No se puede') ||
      err.message.includes('no encontrada') ||
      err.message.includes('Ya existe')) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  // Errores de permisos
  if (err.message.includes('Sin permisos') ||
      err.message.includes('No tienes acceso') ||
      err.message.includes('Solo puedes')) {
    return res.status(403).json({
      success: false,
      error: err.message
    });
  }

  // Errores de autenticación
  if (err.message.includes('Credenciales') ||
      err.message.includes('Token') ||
      err.message.includes('desactivada')) {
    return res.status(401).json({
      success: false,
      error: err.message
    });
  }

  // Error genérico del servidor
  return res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message
  });
}

module.exports = errorMiddleware;
