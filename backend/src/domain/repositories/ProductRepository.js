// src/domain/repositories/ProductRepository.js
// ─────────────────────────────────────────────────────
// Contrato: Repositorio de Productos e Ingredientes
// Maneja productos del menú + sus ingredientes personalizables.
// Endpoints: #23, #24, #25, #26, #27, #28, #29, #30, #31
// ─────────────────────────────────────────────────────

class ProductRepository {
  /**
   * Lista productos de una sucursal con filtros opcionales.
   * Incluye ingredientes personalizables (JOIN).
   * Usado por: #23 GET /api/locales/:localId/productos
   * @param {Object} filters
   * @param {string} filters.localId - UUID del local
   * @param {string} [filters.categoriaId] - Filtrar por categoría
   * @param {boolean} [filters.disponible] - true = solo disponibles
   * @param {boolean} [filters.visible] - true = solo visibles en menú
   * @returns {Promise<Product[]>}
   */
  async findAll(filters) {
    throw new Error('ProductRepository.findAll() no implementado');
  }

  /**
   * Busca un producto por ID con sus ingredientes.
   * Usado por: #24 GET /api/locales/:localId/productos/:id
   * @param {string} id - UUID del producto
   * @returns {Promise<Product|null>}
   */
  async findById(id) {
    throw new Error('ProductRepository.findById() no implementado');
  }

  /**
   * Crea un producto nuevo con sus ingredientes en lote.
   * Usado por: #25 POST /api/locales/:localId/productos
   * @param {Product} product - Entidad Product con ingredientes
   * @returns {Promise<Product>}
   */
  async save(product) {
    throw new Error('ProductRepository.save() no implementado');
  }

  /**
   * Actualiza datos de un producto (nombre, precio, imagen, etc.).
   * Usado por: #26 PATCH /api/locales/:localId/productos/:id
   * @param {string} id - UUID del producto
   * @param {Object} data - Campos a actualizar
   * @returns {Promise<Product>}
   */
  async update(id, data) {
    throw new Error('ProductRepository.update() no implementado');
  }

  /**
   * Toggle rápido de disponibilidad (agotado/disponible).
   * Usado por: #27 PATCH /api/locales/:localId/productos/:id/disponibilidad
   * @param {string} id - UUID del producto
   * @param {boolean} disponible
   * @returns {Promise<Product>}
   */
  async updateDisponibilidad(id, disponible) {
    throw new Error('ProductRepository.updateDisponibilidad() no implementado');
  }

  /**
   * Elimina un producto y sus ingredientes en cascada.
   * Usado por: #28 DELETE /api/locales/:localId/productos/:id
   * @param {string} id - UUID del producto
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error('ProductRepository.delete() no implementado');
  }

  // ── INGREDIENTES PERSONALIZABLES ──

  /**
   * Agrega un ingrediente personalizable a un producto.
   * Usado por: #29 POST /api/locales/:localId/productos/:productoId/ingredientes
   * @param {Object} ingrediente - { productoId, nombreIngrediente, precioExtra, ... }
   * @returns {Promise<Object>}
   */
  async addIngrediente(ingrediente) {
    throw new Error('ProductRepository.addIngrediente() no implementado');
  }

  /**
   * Actualiza un ingrediente personalizable.
   * Usado por: #30 PATCH .../ingredientes/:id
   * @param {string} id - UUID del ingrediente
   * @param {Object} data - Campos a actualizar
   * @returns {Promise<Object>}
   */
  async updateIngrediente(id, data) {
    throw new Error('ProductRepository.updateIngrediente() no implementado');
  }

  /**
   * Elimina un ingrediente personalizable.
   * Usado por: #31 DELETE .../ingredientes/:id
   * @param {string} id - UUID del ingrediente
   * @returns {Promise<void>}
   */
  async deleteIngrediente(id) {
    throw new Error('ProductRepository.deleteIngrediente() no implementado');
  }
}

module.exports = ProductRepository;
