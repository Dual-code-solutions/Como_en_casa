// src/websocket/socketHandler.js
// ─────────────────────────────────────────────────────
// Manejador de WebSockets con Socket.IO
//
// Eventos que escucha:
//   - join_local: Tablet/admin se une al room de su sucursal
//   - leave_local: Salir del room
//
// Eventos que emite (desde los Use Cases):
//   - new_order: Nuevo pedido confirmado desde la tablet
//   - order_updated: Estado de pedido cambió en el Kanban
//   - mesa_updated: Estado de mesa cambió (disponible/ocupada)
//   - new_reservation: Nueva reservación creada
//
// Arquitectura:
//   Cada sucursal es un "room" de Socket.IO.
//   La tablet y el panel admin del mismo local escuchan
//   el mismo room para sincronizarse en tiempo real.
// ─────────────────────────────────────────────────────

const jwt = require('jsonwebtoken');
const logger = require('../infrastructure/logger/logger');

function setupSocket(io) {

  // ── Middleware de autenticación opcional ──
  // La tablet (pública) se conecta SIN token → puede escuchar.
  // El admin se conecta CON token → puede emitir y escuchar.
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId   = decoded.userId;
        socket.userRole = decoded.rol;
        socket.localId  = decoded.localId;
        logger.info('Socket auth OK', {
          userId: decoded.userId,
          rol:    decoded.rol
        });
      } catch (err) {
        logger.warn('Socket token inválido, conectando como público', {
          error: err.message
        });
      }
    }

    // Siempre permitir la conexión (la tablet no tiene token)
    next();
  });

  // ── Manejo de conexiones ──
  io.on('connection', (socket) => {
    logger.info(`🔌 Socket conectado: ${socket.id}`, {
      authenticated: !!socket.userId,
      role:          socket.userRole || 'público'
    });

    // ── JOIN: Unirse al room de una sucursal ──
    // La tablet envía: socket.emit('join_local', { localId: 'uuid-del-local' })
    // El admin se une automáticamente por su token, o también puede enviar join_local
    socket.on('join_local', ({ localId }) => {
      if (!localId) return;

      socket.join(localId);
      logger.info(`📡 Socket ${socket.id} se unió al room: ${localId}`, {
        userId: socket.userId || 'tablet-pública'
      });

      // Confirmar al cliente que se unió
      socket.emit('joined_local', {
        localId,
        message: `Conectado al local: ${localId}`
      });
    });

    // ── LEAVE: Salir del room ──
    socket.on('leave_local', ({ localId }) => {
      if (!localId) return;

      socket.leave(localId);
      logger.info(`📡 Socket ${socket.id} salió del room: ${localId}`);
    });

    // ── Auto-join si el admin tiene localId en su token ──
    if (socket.localId) {
      socket.join(socket.localId);
      logger.info(`📡 Admin auto-joined room: ${socket.localId}`, {
        userId: socket.userId
      });
    }

    // ── PING para verificación de conexión ──
    socket.on('ping_server', () => {
      socket.emit('pong_server', { timestamp: Date.now() });
    });

    // ── Desconexión ──
    socket.on('disconnect', (reason) => {
      logger.info(`🔌 Socket desconectado: ${socket.id}`, {
        reason,
        userId: socket.userId || 'público'
      });
    });

    // ── Errores del socket ──
    socket.on('error', (error) => {
      logger.error('Socket error', {
        socketId: socket.id,
        error:    error.message
      });
    });
  });

  logger.info('⚡ WebSocket handler inicializado');

  return io;
}

module.exports = setupSocket;
