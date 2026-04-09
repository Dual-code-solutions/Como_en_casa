// src/application/use-cases/reservaciones/CreateReservacionUseCase.js
const Reservation = require('../../../domain/entities/Reservation');

class CreateReservacionUseCase {
  constructor({ reservationRepository, mesaRepository, socketIO }) {
    this.reservationRepo = reservationRepository;
    this.mesaRepo        = mesaRepository;
    this.io              = socketIO;
  }

  async execute({ localId, mesaId, nombreCliente, telefono,
                  fechaReserva, horaReserva, numPersonas, notasAdicionales }) {
    // Si se escogió mesa, verificar que exista y no tenga choque de horario
    if (mesaId) {
      const mesa = await this.mesaRepo.findById(mesaId);
      if (!mesa) throw new Error('Mesa no encontrada');

      const hayChoque = await this.reservationRepo.existeChoque(mesaId, fechaReserva, horaReserva);
      if (hayChoque) {
        throw new Error('Ya existe una reservación en esa mesa para esa fecha y hora');
      }
    }

    const reservation = new Reservation({
      localId,
      mesaId,
      nombreCliente,
      telefono,
      fechaReserva,
      horaReserva,
      numPersonas,
      notasAdicionales
    });

    const saved = await this.reservationRepo.save(reservation);

    // Notificar al admin (opcional)
    this.io.to(localId).emit('new_reservation', {
      reservacionId:  saved.id,
      nombre_cliente: nombreCliente,
      fecha:          fechaReserva,
      hora:           horaReserva
    });

    return saved;
  }
}

module.exports = CreateReservacionUseCase;
