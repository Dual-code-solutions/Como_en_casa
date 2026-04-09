// src/infrastructure/logger/logger.js
// ─────────────────────────────────────────────────────
// Logger profesional con Winston.
// Reemplaza todos los console.log del proyecto.
//
// En DESARROLLO: logs con colores y formato legible en terminal.
// En PRODUCCIÓN: logs en formato JSON + archivos error.log y combined.log.
// ─────────────────────────────────────────────────────

const winston = require('winston');
const { combine, timestamp, json, colorize, printf } = winston.format;

// Formato para desarrollo: colores + hora + mensaje legible
const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  printf(({ level, message, timestamp, ...meta }) =>
    `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`
  )
);

// Formato para producción: JSON estructurado para herramientas de monitoreo
const prodFormat = combine(timestamp(), json());

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [
    // Siempre imprime en consola
    new winston.transports.Console(),

    // En producción, además guarda en archivos
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' })
    ] : [])
  ]
});

module.exports = logger;
