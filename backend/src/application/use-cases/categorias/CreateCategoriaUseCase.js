// src/application/use-cases/categorias/CreateCategoriaUseCase.js

class CreateCategoriaUseCase {
  constructor({ categoryRepository }) {
    this.categoryRepo = categoryRepository;
  }

  async execute({ localId, nombre, orden }) {
    return this.categoryRepo.save({ localId, nombre, orden });
  }
}

module.exports = CreateCategoriaUseCase;
