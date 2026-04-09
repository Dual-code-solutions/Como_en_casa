// src/application/use-cases/mesas/CreateMesaUseCase.js
const Mesa = require('../../../domain/entities/Mesa');

class CreateMesaUseCase {
  constructor({ mesaRepository }) {
    this.mesaRepo = mesaRepository;
  }

  async execute({ localId, nombreONumero, capacidad }) {
    const mesa = new Mesa({
      localId,
      nombreONumero,
      capacidad,
      estadoActual: 'disponible'
    });

    return this.mesaRepo.save(mesa);
  }
}

module.exports = CreateMesaUseCase;
