// src/application/use-cases/mesas/UpdateMesaUseCase.js

class UpdateMesaUseCase {
  constructor({ mesaRepository }) {
    this.mesaRepo = mesaRepository;
  }

  async execute({ mesaId, data }) {
    const mesa = await this.mesaRepo.findById(mesaId);
    if (!mesa) throw new Error('Mesa no encontrada');

    return this.mesaRepo.update(mesaId, data);
  }
}

module.exports = UpdateMesaUseCase;
