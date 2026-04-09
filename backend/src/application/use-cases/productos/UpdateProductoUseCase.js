// src/application/use-cases/productos/UpdateProductoUseCase.js

class UpdateProductoUseCase {
  constructor({ productRepository }) {
    this.productRepo = productRepository;
  }

  async execute({ productoId, data }) {
    const producto = await this.productRepo.findById(productoId);
    if (!producto) throw new Error('Producto no encontrado');

    return this.productRepo.update(productoId, data);
  }
}

module.exports = UpdateProductoUseCase;
