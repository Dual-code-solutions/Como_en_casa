// src/application/use-cases/categorias/DeleteCategoriaUseCase.js

class DeleteCategoriaUseCase {
  constructor({ categoryRepository }) {
    this.categoryRepo = categoryRepository;
  }

  async execute({ categoriaId }) {
    const categoria = await this.categoryRepo.findById(categoriaId);
    if (!categoria) throw new Error('Categoría no encontrada');

    // Advertir si tiene productos vinculados
    const numProductos = await this.categoryRepo.countProductos(categoriaId);
    if (numProductos > 0) {
      throw new Error(`No se puede eliminar: tiene ${numProductos} producto(s) vinculados. Reasígnalos primero.`);
    }

    return this.categoryRepo.delete(categoriaId);
  }
}

module.exports = DeleteCategoriaUseCase;
