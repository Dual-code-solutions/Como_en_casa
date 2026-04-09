// src/domain/repositories/ReservationRepository.js
// ─────────────────────────────────────────────────────
// Contrato: Repositorio de Reservaciones
// Maneja reservas con anticipo, asignación de mesa y filtros.
// Endpoints: #36, #37, #38
// ─────────────────────────────────────────────────────

class ReservationRepository {
  /**
   * Lista reservaciones de una sucursal con filtros.
   * Usado por: #37 GET /api/reservaciones
   * @param {Object} filters
   * @param {string} filters.localId - UUID del local (obligatorio)
   * @param {string} [filters.fecha] - Filtrar por fecha (YYYY-MM-DD)
   * @param {string} [filters.estado] - Filtrar por estado (pendiente, aceptada, cancelada)
   * @returns {Promise<Reservation[]>}
   */
  async findAll(filters) {
    throw new Error('ReservationRepository.findAll() no implementado');
  }

  /**
   * Busca una reservación por ID.
   * @param {string} id - UUID de la reservación
   * @returns {Promise<Reservation|null>}
   */
  async findById(id) {
    throw new Error('ReservationRepository.findById() no implementado');
  }

  /**
   * Crea una nueva reservación (estado 'pendiente').
   * Usado por: #36 POST /api/reservaciones
   * @param {Reservation} reservation - Entidad Reservation
   * @returns {Promise<Reservation>}
   */
  async save(reservation) {
    throw new Error('ReservationRepository.save() no implementado');
  }

  /**
   * Actualiza una reservación (anticipo, estado, mesa, etc.).
   * Usado por: #38 PATCH /api/reservaciones/:id
   * @param {string} id - UUID de la reservación
   * @param {Object} data - Campos a actualizar
   * @returns {Promise<Reservation>}
   */
  async update(id, data) {
    throw new Error('ReservationRepository.update() no implementado');
  }

  /**
   * Verifica si una mesa tiene reservaciones activas en una fecha/hora.
   * Se usa al crear una nueva reservación para evitar choques.
   * @param {string} mesaId - UUID de la mesa
   * @param {string} fecha - YYYY-MM-DD
   * @param {string} hora - HH:MM
   * @returns {Promise<boolean>}
   */
  async existeChoque(mesaId, fecha, hora) {
    throw new Error('ReservationRepository.existeChoque() no implementado');
  }
}

module.exports = ReservationRepository;
