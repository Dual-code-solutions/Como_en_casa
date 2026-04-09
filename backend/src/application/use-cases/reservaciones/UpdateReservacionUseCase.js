// src/application/use-cases/reservaciones/UpdateReservacionUseCase.js

class UpdateReservacionUseCase {
  constructor({ reservationRepository }) {
    this.reservationRepo = reservationRepository;
  }

  async execute({ reservacionId, data }) {
    const reservacion = await this.reservationRepo.findById(reservacionId);
    if (!reservacion) throw new Error('Reservación no encontrada');

    return this.reservationRepo.update(reservacionId, data);
  }
}

module.exports = UpdateReservacionUseCase;
