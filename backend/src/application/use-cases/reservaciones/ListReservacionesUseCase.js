// src/application/use-cases/reservaciones/ListReservacionesUseCase.js

class ListReservacionesUseCase {
  constructor({ reservationRepository }) {
    this.reservationRepo = reservationRepository;
  }

  async execute({ localId, fecha, estado }) {
    return this.reservationRepo.findAll({ localId, fecha, estado });
  }
}

module.exports = ListReservacionesUseCase;
