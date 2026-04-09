// src/application/use-cases/reservaciones/UpdateReservacionUseCase.js

class UpdateReservacionUseCase {
  constructor({ reservationRepository, socketIO }) {
    this.reservationRepo = reservationRepository;
    this.io              = socketIO;
  }

  async execute({ reservacionId, data }) {
    const reservacion = await this.reservationRepo.findById(reservacionId);
    if (!reservacion) throw new Error('Reservación no encontrada');

    const updated = await this.reservationRepo.update(reservacionId, data);

    // Emitir evento al local del admin
    if (data.estado) {
      this.io.to(reservacion.localId).emit('reservation_updated', {
        reservacionId: updated.id,
        estado:        updated.estado,
        nombreCliente: updated.nombreCliente,
        fecha:         updated.fechaReserva,
        hora:          updated.horaReserva
      });

      // También emitir al room personal del cliente (por si está escuchando)
      this.io.to(`reserva_${reservacionId}`).emit('reservation_updated', {
        reservacionId: updated.id,
        estado:        updated.estado
      });
    }

    return updated;
  }
}

module.exports = UpdateReservacionUseCase;
