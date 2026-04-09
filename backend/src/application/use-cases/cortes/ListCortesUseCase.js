// src/application/use-cases/cortes/ListCortesUseCase.js

class ListCortesUseCase {
  constructor({ corteRepository }) {
    this.corteRepo = corteRepository;
  }

  async execute({ localId, desde, hasta }) {
    return this.corteRepo.findAll({ localId, desde, hasta });
  }
}

module.exports = ListCortesUseCase;
