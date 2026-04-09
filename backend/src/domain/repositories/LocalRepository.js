// src/domain/repositories/LocalRepository.js
// ─────────────────────────────────────────────────────
// Contrato: Repositorio de Locales/Sucursales
// CRUD completo de sucursales (solo accesible al dueño).
// Endpoints: #09, #10, #11, #12, #13
// ─────────────────────────────────────────────────────

class LocalRepository {
  /**
   * Lista todas las sucursales.
   * Usado por: #09 GET /api/locales (solo dueño)
   * @returns {Promise<Object[]>}
   */
  async findAll() {
    throw new Error('LocalRepository.findAll() no implementado');
  }

  /**
   * Busca una sucursal por su ID.
   * Usado por: #10 GET /api/locales/:id
   * @param {string} id - UUID del local
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    throw new Error('LocalRepository.findById() no implementado');
  }

  /**
   * Busca una sucursal por su slug (URL amigable).
   * @param {string} slug
   * @returns {Promise<Object|null>}
   */
  async findBySlug(slug) {
    throw new Error('LocalRepository.findBySlug() no implementado');
  }

  /**
   * Crea una nueva sucursal.
   * Usado por: #11 POST /api/locales (solo dueño)
   * @param {Object} data - { nombreSucursal, slug, configuracion? }
   * @returns {Promise<Object>}
   */
  async create(data) {
    throw new Error('LocalRepository.create() no implementado');
  }

  /**
   * Actualiza datos de una sucursal.
   * Usado por: #12 PATCH /api/locales/:id (solo dueño)
   * @param {string} id - UUID del local
   * @param {Object} data - { nombreSucursal?, slug?, configuracion? }
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    throw new Error('LocalRepository.update() no implementado');
  }

  /**
   * Elimina una sucursal.
   * Usado por: #13 DELETE /api/locales/:id (solo dueño)
   * @param {string} id - UUID del local
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error('LocalRepository.delete() no implementado');
  }
}

module.exports = LocalRepository;
