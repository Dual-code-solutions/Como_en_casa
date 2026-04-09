// src/domain/repositories/UserRepository.js
// ─────────────────────────────────────────────────────
// Contrato: Repositorio de Usuarios/Perfiles
// Maneja perfiles vinculados a auth.users de Supabase.
// Endpoints: #04, #05, #06, #07, #08
// ─────────────────────────────────────────────────────

class UserRepository {
  /**
   * Lista perfiles. El dueño ve todos, el admin ve solo los de su local.
   * Usado por: #04 GET /api/users
   * @param {Object} [filters]
   * @param {string} [filters.localId] - Filtrar por local
   * @returns {Promise<User[]>}
   */
  async findAll(filters) {
    throw new Error('UserRepository.findAll() no implementado');
  }

  /**
   * Busca un perfil por su ID (mismo ID que auth.users).
   * Usado por: #05 GET /api/users/:id
   * @param {string} id - UUID del usuario
   * @returns {Promise<User|null>}
   */
  async findById(id) {
    throw new Error('UserRepository.findById() no implementado');
  }

  /**
   * Crea un nuevo usuario (admin) en Supabase Auth + tabla perfiles.
   * Usado por: #06 POST /api/users (solo dueño)
   * @param {Object} userData - { email, password, localId, rol, primerNombre, ... }
   * @returns {Promise<User>}
   */
  async create(userData) {
    throw new Error('UserRepository.create() no implementado');
  }

  /**
   * Actualiza datos del perfil (nombre, teléfono, etc.).
   * Usado por: #07 PATCH /api/users/:id
   * @param {string} id - UUID del usuario
   * @param {Object} data - Campos a actualizar
   * @returns {Promise<User>}
   */
  async update(id, data) {
    throw new Error('UserRepository.update() no implementado');
  }

  /**
   * Activa o desactiva la cuenta de un admin.
   * Usado por: #08 PATCH /api/users/:id/toggle-status
   * @param {string} id - UUID del usuario
   * @param {boolean} estado - true (activo) / false (desactivado)
   * @returns {Promise<User>}
   */
  async toggleStatus(id, estado) {
    throw new Error('UserRepository.toggleStatus() no implementado');
  }

  /**
   * Busca un perfil por email (para validaciones de duplicados).
   * @param {string} email
   * @returns {Promise<User|null>}
   */
  async findByEmail(email) {
    throw new Error('UserRepository.findByEmail() no implementado');
  }
}

module.exports = UserRepository;
