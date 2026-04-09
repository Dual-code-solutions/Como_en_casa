// src/domain/repositories/CorteRepository.js
// ─────────────────────────────────────────────────────
// Contrato: Repositorio de Cortes de Caja
// Genera y consulta resúmenes financieros diarios.
// Endpoints: #39, #40, #41
// ─────────────────────────────────────────────────────

class CorteRepository {
  /**
   * Guarda un nuevo corte de caja generado.
   * Usado por: #39 POST /api/locales/:localId/cortes
   * @param {Object} corte
   * @param {string} corte.localId
   * @param {string} corte.adminId - Quién hizo el cierre
   * @param {string} corte.fechaCorte - YYYY-MM-DD
   * @param {number} corte.totalIngresosDia
   * @param {number} corte.conteoPedidosLocal
   * @param {number} corte.conteoPedidosDomicilio
   * @param {number} corte.conteoPedidosLlevar
   * @param {Object} corte.resumenMetodosPago - JSON con desglose
   * @returns {Promise<Object>}
   */
  async save(corte) {
    throw new Error('CorteRepository.save() no implementado');
  }

  /**
   * Lista historial de cortes de una sucursal con rango de fechas.
   * Usado por: #40 GET /api/locales/:localId/cortes
   * @param {Object} filters
   * @param {string} filters.localId - UUID del local
   * @param {string} [filters.desde] - Fecha inicio (YYYY-MM-DD)
   * @param {string} [filters.hasta] - Fecha fin (YYYY-MM-DD)
   * @returns {Promise<Object[]>}
   */
  async findAll(filters) {
    throw new Error('CorteRepository.findAll() no implementado');
  }

  /**
   * Busca un corte de caja por ID.
   * Usado por: #41 GET /api/locales/:localId/cortes/:id
   * @param {string} id - UUID del corte
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    throw new Error('CorteRepository.findById() no implementado');
  }

  /**
   * Verifica si ya existe un corte para ese local en esa fecha.
   * Evita generar cortes duplicados del mismo día.
   * @param {string} localId - UUID del local
   * @param {string} fecha - YYYY-MM-DD
   * @returns {Promise<boolean>}
   */
  async existeCorteEnFecha(localId, fecha) {
    throw new Error('CorteRepository.existeCorteEnFecha() no implementado');
  }
}

module.exports = CorteRepository;
