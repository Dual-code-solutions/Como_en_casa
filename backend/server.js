// server.js
// ─────────────────────────────────────────────────────
// PUNTO DE ENTRADA DEL SERVIDOR
// ─────────────────────────────────────────────────────
// Solo hace 4 cosas:
//   1. Carga variables de entorno
//   2. Valida que existan las variables críticas
//   3. Crea HTTP server + Socket.IO
//   4. Arranca en el puerto configurado
// ─────────────────────────────────────────────────────

require('dotenv').config();

const http = require('http');
const { Server: SocketServer } = require('socket.io');
const { validateEnv } = require('./src/infrastructure/config/env');
const logger = require('./src/infrastructure/logger/logger');
const createApp = require('./src/app');
const setupSocket = require('./src/websocket/socketHandler');

// 1. Validar variables de entorno antes de todo
validateEnv();

// 2. Crear instancia de Socket.IO
const PORT = process.env.PORT || 3000;

// Crear un server temporal para poder pasar io a createApp
const tempApp = require('express')();
const httpServer = http.createServer(tempApp);

const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true
  },
  pingTimeout:  60000,
  pingInterval: 25000
});

// 3. Inicializar WebSocket handler
setupSocket(io);

// 4. Crear la aplicación Express con inyección de io
const app = createApp(io);

// Reemplazar el handler del httpServer con la app real
httpServer.removeAllListeners('request');
httpServer.on('request', app);

// 5. Arrancar el servidor
httpServer.listen(PORT, () => {
  logger.info('═══════════════════════════════════════════════');
  logger.info(`  🏠 Como en Casa — Backend API`);
  logger.info(`  🚀 Servidor:    http://localhost:${PORT}`);
  logger.info(`  📚 Swagger:     http://localhost:${PORT}/api/docs`);
  logger.info(`  ❤️  Health:      http://localhost:${PORT}/api/health`);
  logger.info(`  ⚡ WebSocket:   ws://localhost:${PORT}`);
  logger.info(`  🌍 Entorno:     ${process.env.NODE_ENV || 'development'}`);
  logger.info('═══════════════════════════════════════════════');
});

// 6. Manejo de errores no capturados
process.on('unhandledRejection', (reason) => {
  logger.error('❌ Unhandled Rejection:', { reason: reason?.message || reason });
});

process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', { error: error.message, stack: error.stack });
  process.exit(1);
});

// 7. Shutdown graceful
process.on('SIGTERM', () => {
  logger.info('🛑 SIGTERM recibido. Cerrando servidor...');
  httpServer.close(() => {
    logger.info('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});
