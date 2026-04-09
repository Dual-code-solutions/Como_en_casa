// src/application/use-cases/mesas/ListMesasUseCase.js

class ListMesasUseCase {
  constructor({ mesaRepository }) {
    this.mesaRepo = mesaRepository;
  }

  async execute({ localId }) {
    return this.mesaRepo.findAll(localId);
  }
}

module.exports = ListMesasUseCase;
