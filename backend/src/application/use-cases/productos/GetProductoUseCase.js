// src/application/use-cases/productos/GetProductoUseCase.js

class GetProductoUseCase {
  constructor({ productRepository }) {
    this.productRepo = productRepository;
  }

  async execute({ productoId }) {
    const producto = await this.productRepo.findById(productoId);
    if (!producto) throw new Error('Producto no encontrado');
    return producto;
  }
}

module.exports = GetProductoUseCase;
