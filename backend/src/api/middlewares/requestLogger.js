// src/api/middlewares/requestLogger.js
// ─────────────────────────────────────────────────────
// Middleware de Registro de Requests HTTP
// Registra cada petición que entra al servidor con:
// método, URL, status code, duración y usuario.
//
// Niveles automáticos:
//   - 5xx → error
//   - 4xx → warn
//   - 2xx/3xx → info
// ─────────────────────────────────────────────────────

const logger = require('../../infrastructure/logger/logger');

function requestLogger(req, res, next) {
  const start = Date.now();

  // Se ejecuta cuando Express termina de enviar la respuesta
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error'
                : res.statusCode >= 400 ? 'warn'
                : 'info';

    logger[level](`${req.method} ${req.originalUrl}`, {
      status:   res.statusCode,
      duration: `${duration}ms`,
      user:     req.userId || 'anónimo',
      ip:       req.ip
    });
  });

  next();
}

module.exports = requestLogger;
