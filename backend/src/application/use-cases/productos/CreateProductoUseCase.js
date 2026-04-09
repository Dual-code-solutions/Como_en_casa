// src/application/use-cases/productos/CreateProductoUseCase.js
const { Product } = require('../../../domain/entities/Product');

class CreateProductoUseCase {
  constructor({ productRepository }) {
    this.productRepo = productRepository;
  }

  async execute({ localId, categoriaId, nombre, descripcion, precioBase,
                  imagenUrl, disponible, visibleMenu, ingredientes }) {
    const product = new Product({
      localId,
      categoriaId,
      nombre,
      descripcion,
      precioBase,
      imagenUrl,
      disponible: disponible !== undefined ? disponible : true,
      visibleMenu: visibleMenu !== undefined ? visibleMenu : true,
      ingredientes: ingredientes || []
    });

    return this.productRepo.save(product);
  }
}

module.exports = CreateProductoUseCase;
