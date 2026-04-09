// src/application/use-cases/categorias/UpdateCategoriaUseCase.js

class UpdateCategoriaUseCase {
  constructor({ categoryRepository }) {
    this.categoryRepo = categoryRepository;
  }

  async execute({ categoriaId, data }) {
    const categoria = await this.categoryRepo.findById(categoriaId);
    if (!categoria) throw new Error('Categoría no encontrada');

    return this.categoryRepo.update(categoriaId, data);
  }
}

module.exports = UpdateCategoriaUseCase;
