// src/application/use-cases/productos/ToggleDisponibilidadUseCase.js

class ToggleDisponibilidadUseCase {
  constructor({ productRepository }) {
    this.productRepo = productRepository;
  }

  async execute({ productoId, disponible }) {
    const producto = await this.productRepo.findById(productoId);
    if (!producto) throw new Error('Producto no encontrado');

    return this.productRepo.updateDisponibilidad(productoId, disponible);
  }
}

module.exports = ToggleDisponibilidadUseCase;
