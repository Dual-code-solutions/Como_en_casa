// src/application/use-cases/mesas/ChangeMesaEstadoUseCase.js
const Mesa = require('../../../domain/entities/Mesa');

class ChangeMesaEstadoUseCase {
  constructor({ mesaRepository, socketIO }) {
    this.mesaRepo = mesaRepository;
    this.io       = socketIO;
  }

  async execute({ mesaId, estadoActual }) {
    // Validar estado
    Mesa.validarEstado(estadoActual);

    const mesa = await this.mesaRepo.findById(mesaId);
    if (!mesa) throw new Error('Mesa no encontrada');

    // Actualizar estado
    const updated = await this.mesaRepo.updateEstado(mesaId, estadoActual);

    // Emitir WebSocket para que la tablet refresque
    this.io.to(mesa.localId).emit('mesa_updated', {
      mesaId,
      estado_actual: estadoActual
    });

    return updated;
  }
}

module.exports = ChangeMesaEstadoUseCase;
