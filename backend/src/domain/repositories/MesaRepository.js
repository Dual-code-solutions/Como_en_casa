// src/domain/repositories/MesaRepository.js
// ─────────────────────────────────────────────────────
// Contrato: Repositorio de Mesas
// Operaciones para el catálogo de mesas y sus estados.
// Endpoints: #14, #15, #16, #17, #18
// ─────────────────────────────────────────────────────

class MesaRepository {
  /**
   * Lista todas las mesas de una sucursal.
   * Usado por: #14 GET /api/locales/:localId/mesas
   * La tablet del cliente y el panel admin usan este mismo método.
   * @param {string} localId - UUID del local
   * @returns {Promise<Mesa[]>}
   */
  async findAll(localId) {
    throw new Error('MesaRepository.findAll() no implementado');
  }

  /**
   * Busca una mesa por su ID.
   * @param {string} id - UUID de la mesa
   * @returns {Promise<Mesa|null>}
   */
  async findById(id) {
    throw new Error('MesaRepository.findById() no implementado');
  }

  /**
   * Crea una nueva mesa en el catálogo.
   * Usado por: #15 POST /api/locales/:localId/mesas
   * @param {Mesa} mesa - Entidad Mesa
   * @returns {Promise<Mesa>} - Mesa guardada con ID generado
   */
  async save(mesa) {
    throw new Error('MesaRepository.save() no implementado');
  }

  /**
   * Actualiza nombre y/o capacidad de una mesa.
   * Usado por: #16 PATCH /api/locales/:localId/mesas/:id
   * @param {string} id - UUID de la mesa
   * @param {Object} data - { nombreONumero?, capacidad? }
   * @returns {Promise<Mesa>}
   */
  async update(id, data) {
    throw new Error('MesaRepository.update() no implementado');
  }

  /**
   * Cambia el estado de una mesa (disponible/ocupada).
   * Usado por: #17 PATCH /api/locales/:localId/mesas/:id/estado
   * @param {string} id - UUID de la mesa
   * @param {string} estado - 'disponible' | 'ocupada'
   * @returns {Promise<Mesa>}
   */
  async updateEstado(id, estado) {
    throw new Error('MesaRepository.updateEstado() no implementado');
  }

  /**
   * Elimina una mesa del catálogo.
   * Usado por: #18 DELETE /api/locales/:localId/mesas/:id
   * @param {string} id - UUID de la mesa
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error('MesaRepository.delete() no implementado');
  }

  /**
   * Verifica si una mesa tiene pedidos activos vinculados.
   * Se usa antes de eliminar una mesa para evitar inconsistencias.
   * @param {string} id - UUID de la mesa
   * @returns {Promise<boolean>}
   */
  async hasActiveOrders(id) {
    throw new Error('MesaRepository.hasActiveOrders() no implementado');
  }
}

module.exports = MesaRepository;
