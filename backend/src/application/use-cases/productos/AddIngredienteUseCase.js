// src/application/use-cases/productos/AddIngredienteUseCase.js

class AddIngredienteUseCase {
  constructor({ productRepository }) {
    this.productRepo = productRepository;
  }

  async execute({ productoId, nombreIngrediente, precioExtra, permiteDoble, esBase }) {
    // Verificar que el producto exista
    const producto = await this.productRepo.findById(productoId);
    if (!producto) throw new Error('Producto no encontrado');

    return this.productRepo.addIngrediente({
      productoId,
      nombreIngrediente,
      precioExtra: precioExtra || 0,
      permiteDoble: permiteDoble !== undefined ? permiteDoble : true,
      esBase: esBase !== undefined ? esBase : true
    });
  }
}

module.exports = AddIngredienteUseCase;
