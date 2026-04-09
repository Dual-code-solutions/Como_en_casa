// src/domain/entities/Mesa.js
// ─────────────────────────────────────────────────────
// Entidad: Mesa
// Representa una mesa física del restaurante.
// Maneja estados de disponibilidad para el kiosko (tablet).
// ─────────────────────────────────────────────────────

class Mesa {
  static ESTADOS = ['disponible', 'ocupada'];

  constructor({ id, localId, nombreONumero, capacidad, estadoActual = 'disponible', creadoAt }) {
    this.id             = id;
    this.localId        = localId;
    this.nombreONumero  = nombreONumero;
    this.capacidad      = capacidad;
    this.estadoActual   = estadoActual;
    this.creadoAt       = creadoAt || new Date();
  }

  // REGLA: Marcar la mesa como ocupada (cuando un cliente confirma pedido en tablet)
  ocupar() {
    this.estadoActual = 'ocupada';
    return this;
  }

  // REGLA: Liberar la mesa (cuando el staff la limpia o todos los pedidos se finalizaron)
  liberar() {
    this.estadoActual = 'disponible';
    return this;
  }

  // REGLA: Verificar si la mesa está disponible
  estaDisponible() {
    return this.estadoActual === 'disponible';
  }

  // REGLA: Verificar si la mesa tiene capacidad suficiente para N personas
  tieneCapacidadPara(numPersonas) {
    return this.capacidad >= numPersonas;
  }

  // REGLA: Validar que el estado proporcionado sea válido
  static validarEstado(estado) {
    if (!Mesa.ESTADOS.includes(estado)) {
      throw new Error(`Estado de mesa inválido: ${estado}. Debe ser: ${Mesa.ESTADOS.join(', ')}`);
    }
  }
}

module.exports = Mesa;
