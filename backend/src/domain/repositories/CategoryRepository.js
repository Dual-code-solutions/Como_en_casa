// src/domain/repositories/CategoryRepository.js
// ─────────────────────────────────────────────────────
// Contrato: Repositorio de Categorías del Menú
// CRUD de categorías (Hamburguesas, Bebidas, Postres, etc.)
// Endpoints: #19, #20, #21, #22
// ─────────────────────────────────────────────────────

class CategoryRepository {
  /**
   * Lista categorías de una sucursal ordenadas por campo 'orden'.
   * Usado por: #19 GET /api/locales/:localId/categorias
   * La tablet usa esto para el carrusel de categorías.
   * @param {string} localId - UUID del local
   * @returns {Promise<Object[]>}
   */
  async findAll(localId) {
    throw new Error('CategoryRepository.findAll() no implementado');
  }

  /**
   * Busca una categoría por ID.
   * @param {string} id - UUID de la categoría
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    throw new Error('CategoryRepository.findById() no implementado');
  }

  /**
   * Crea una nueva categoría.
   * Usado por: #20 POST /api/locales/:localId/categorias
   * @param {Object} data - { localId, nombre, orden? }
   * @returns {Promise<Object>}
   */
  async save(data) {
    throw new Error('CategoryRepository.save() no implementado');
  }

  /**
   * Actualiza nombre u orden de una categoría.
   * Usado por: #21 PATCH /api/locales/:localId/categorias/:id
   * @param {string} id - UUID de la categoría
   * @param {Object} data - { nombre?, orden? }
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    throw new Error('CategoryRepository.update() no implementado');
  }

  /**
   * Elimina una categoría.
   * Usado por: #22 DELETE /api/locales/:localId/categorias/:id
   * @param {string} id - UUID de la categoría
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error('CategoryRepository.delete() no implementado');
  }

  /**
   * Verifica si una categoría tiene productos vinculados.
   * Se usa antes de eliminar para advertir al admin.
   * @param {string} id - UUID de la categoría
   * @returns {Promise<number>} - Cantidad de productos en esa categoría
   */
  async countProductos(id) {
    throw new Error('CategoryRepository.countProductos() no implementado');
  }
}

module.exports = CategoryRepository;
