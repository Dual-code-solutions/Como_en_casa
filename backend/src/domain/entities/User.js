// src/domain/entities/User.js
// ─────────────────────────────────────────────────────
// Entidad: Usuario (Perfil)
// Representa un dueño o admin (cajero/recepcionista).
// Vinculado a auth.users de Supabase por el mismo ID.
// ─────────────────────────────────────────────────────

class User {
  static ROLES = ['dueño', 'admin'];

  constructor({ id, localId, rol, primerNombre, segundoNombre,
                primerApellido, segundoApellido, telefonoContacto,
                estadoCuenta = true, email, fechaRegistro }) {
    this.id               = id;
    this.localId          = localId || null;
    this.rol              = rol;
    this.primerNombre     = primerNombre;
    this.segundoNombre    = segundoNombre || '';
    this.primerApellido   = primerApellido;
    this.segundoApellido  = segundoApellido || '';
    this.telefonoContacto = telefonoContacto || '';
    this.estadoCuenta     = estadoCuenta;
    this.email            = email || null;
    this.fechaRegistro    = fechaRegistro || new Date();
  }

  // REGLA: Obtener el nombre completo formateado
  getNombreCompleto() {
    const partes = [
      this.primerNombre, this.segundoNombre,
      this.primerApellido, this.segundoApellido
    ].filter(Boolean);
    return partes.join(' ');
  }

  // REGLA: Verificar si el usuario es dueño (acceso total)
  esDueno() {
    return this.rol === 'dueño';
  }

  // REGLA: Verificar si el usuario es admin (acceso limitado a su local)
  esAdmin() {
    return this.rol === 'admin';
  }

  // REGLA: Desactivar la cuenta (el admin no podrá iniciar sesión)
  desactivar() {
    if (this.rol === 'dueño') {
      throw new Error('No se puede desactivar la cuenta del dueño');
    }
    this.estadoCuenta = false;
    return this;
  }

  // REGLA: Reactivar la cuenta
  activar() {
    this.estadoCuenta = true;
    return this;
  }

  // REGLA: Verificar si la cuenta está activa
  estaActivo() {
    return this.estadoCuenta === true;
  }

  // REGLA: Verificar si un admin pertenece a un local específico
  perteneceALocal(localId) {
    if (this.esDueno()) return true; // El dueño pertenece a todos
    return this.localId === localId;
  }

  // REGLA: Validar que el rol proporcionado sea válido
  static validarRol(rol) {
    if (!User.ROLES.includes(rol)) {
      throw new Error(`Rol inválido: ${rol}. Debe ser: ${User.ROLES.join(', ')}`);
    }
  }
}

module.exports = User;
