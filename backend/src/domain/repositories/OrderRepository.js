// src/domain/repositories/OrderRepository.js
// ─────────────────────────────────────────────────────
// Contrato: Repositorio de Pedidos
// Define QUÉ operaciones de datos se necesitan para pedidos.
// NO dice CÓMO se hacen (eso lo hace SupabaseOrderRepository).
// ─────────────────────────────────────────────────────

class OrderRepository {
  /**
   * Busca un pedido por su ID, incluyendo detalle y mesa.
   * @param {string} id - UUID del pedido
   * @returns {Promise<Order|null>}
   */
  async findById(id) {
    throw new Error('OrderRepository.findById() no implementado');
  }

  /**
   * Lista pedidos con filtros y paginación.
   * Usado por: #33 GET /api/orders
   * @param {Object} filters
   * @param {string} filters.localId - UUID del local (obligatorio)
   * @param {string} [filters.estado] - Filtrar por estado (entrante, cocina, etc.)
   * @param {string} [filters.fecha] - Filtrar por fecha (YYYY-MM-DD)
   * @param {string} [filters.mesaId] - Filtrar por mesa específica
   * @param {number} [filters.page=1]
   * @param {number} [filters.limit=30]
   * @returns {Promise<{data: Order[], meta: Object}>}
   */
  async findAll(filters) {
    throw new Error('OrderRepository.findAll() no implementado');
  }

  /**
   * Guarda un pedido nuevo con sus items de detalle.
   * Usado por: #32 POST /api/orders/confirm
   * @param {Order} order - Entidad Order con items
   * @returns {Promise<Order>} - Pedido guardado con ID generado
   */
  async save(order) {
    throw new Error('OrderRepository.save() no implementado');
  }

  /**
   * Actualiza el estado de un pedido en el flujo Kanban.
   * Usado por: #35 PATCH /api/orders/:id/estado
   * @param {string} id - UUID del pedido
   * @param {string} estado - Nuevo estado
   * @returns {Promise<Order>}
   */
  async updateEstado(id, estado) {
    throw new Error('OrderRepository.updateEstado() no implementado');
  }

  /**
   * Cuenta pedidos activos vinculados a una mesa.
   * Se usa para saber si se puede liberar una mesa al finalizar un pedido.
   * @param {string} mesaId - UUID de la mesa
   * @returns {Promise<number>} - Cantidad de pedidos activos
   */
  async countActivosPorMesa(mesaId) {
    throw new Error('OrderRepository.countActivosPorMesa() no implementado');
  }
}

module.exports = OrderRepository;
