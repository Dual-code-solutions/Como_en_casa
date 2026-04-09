// src/application/use-cases/productos/DeleteIngredienteUseCase.js

class DeleteIngredienteUseCase {
  constructor({ productRepository }) {
    this.productRepo = productRepository;
  }

  async execute({ ingredienteId }) {
    return this.productRepo.deleteIngrediente(ingredienteId);
  }
}

module.exports = DeleteIngredienteUseCase;
