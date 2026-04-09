// src/application/use-cases/productos/DeleteProductoUseCase.js

class DeleteProductoUseCase {
  constructor({ productRepository }) {
    this.productRepo = productRepository;
  }

  async execute({ productoId }) {
    const producto = await this.productRepo.findById(productoId);
    if (!producto) throw new Error('Producto no encontrado');

    return this.productRepo.delete(productoId);
  }
}

module.exports = DeleteProductoUseCase;
