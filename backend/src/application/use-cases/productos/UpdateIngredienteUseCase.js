// src/application/use-cases/productos/UpdateIngredienteUseCase.js

class UpdateIngredienteUseCase {
  constructor({ productRepository }) {
    this.productRepo = productRepository;
  }

  async execute({ ingredienteId, data }) {
    return this.productRepo.updateIngrediente(ingredienteId, data);
  }
}

module.exports = UpdateIngredienteUseCase;
