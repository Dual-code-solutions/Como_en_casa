// src/application/use-cases/cortes/GetCorteUseCase.js

class GetCorteUseCase {
  constructor({ corteRepository }) {
    this.corteRepo = corteRepository;
  }

  async execute({ corteId }) {
    const corte = await this.corteRepo.findById(corteId);
    if (!corte) throw new Error('Corte de caja no encontrado');
    return corte;
  }
}

module.exports = GetCorteUseCase;
