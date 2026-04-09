// src/application/use-cases/productos/ListProductosUseCase.js

class ListProductosUseCase {
  constructor({ productRepository }) {
    this.productRepo = productRepository;
  }

  async execute({ localId, categoriaId, disponible, visible }) {
    return this.productRepo.findAll({ localId, categoriaId, disponible, visible });
  }
}

module.exports = ListProductosUseCase;
