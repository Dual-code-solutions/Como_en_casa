// src/application/use-cases/categorias/ListCategoriasUseCase.js

class ListCategoriasUseCase {
  constructor({ categoryRepository }) {
    this.categoryRepo = categoryRepository;
  }

  async execute({ localId }) {
    return this.categoryRepo.findAll(localId);
  }
}

module.exports = ListCategoriasUseCase;
