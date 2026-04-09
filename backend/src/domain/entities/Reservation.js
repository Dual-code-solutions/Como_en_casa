// src/domain/entities/Reservation.js
// ─────────────────────────────────────────────────────
// Entidad: Reservación
// Maneja el flujo de reservas con anticipo de $250.
// Estados: pendiente → aceptada | cancelada
// ─────────────────────────────────────────────────────

class Reservation {
  static ESTADOS = ['pendiente', 'aceptada', 'cancelada'];

  static MONTO_ANTICIPO_DEFAULT = 250.00;

  constructor({ id, localId, mesaId, nombreCliente, telefono,
                fechaReserva, horaReserva, numPersonas,
                notasAdicionales, estado = 'pendiente',
                anticipoPagado = false, montoAnticipo,
                metodoPagoAnticipo, creadoAt }) {
    this.id                  = id;
    this.localId             = localId;
    this.mesaId              = mesaId || null;
    this.nombreCliente       = nombreCliente;
    this.telefono            = telefono;
    this.fechaReserva        = fechaReserva;
    this.horaReserva         = horaReserva;
    this.numPersonas         = numPersonas;
    this.notasAdicionales    = notasAdicionales || '';
    this.estado              = estado;
    this.anticipoPagado      = anticipoPagado;
    this.montoAnticipo       = montoAnticipo || Reservation.MONTO_ANTICIPO_DEFAULT;
    this.metodoPagoAnticipo  = metodoPagoAnticipo || null;
    this.creadoAt            = creadoAt || new Date();
  }

  // REGLA: Confirmar anticipo y aceptar la reservación
  confirmarAnticipo(metodoPago) {
    if (this.estado !== 'pendiente') {
      throw new Error('Solo se puede confirmar anticipo en una reservación pendiente');
    }
    this.anticipoPagado = true;
    this.estado = 'aceptada';
    this.metodoPagoAnticipo = metodoPago || null;
    return this;
  }

  // REGLA: Aceptar sin anticipo (caso especial, decisión del admin)
  aceptar() {
    if (this.estado !== 'pendiente') {
      throw new Error('Solo se puede aceptar una reservación pendiente');
    }
    this.estado = 'aceptada';
    return this;
  }

  // REGLA: Cancelar la reservación (desde cualquier estado excepto ya cancelada)
  cancelar() {
    if (this.estado === 'cancelada') {
      throw new Error('La reservación ya está cancelada');
    }
    this.estado = 'cancelada';
    return this;
  }

  // REGLA: Asignar una mesa a la reservación
  asignarMesa(mesaId) {
    this.mesaId = mesaId;
    return this;
  }

  // REGLA: Verificar si la reservación está activa (no cancelada)
  estaActiva() {
    return this.estado !== 'cancelada';
  }

  // REGLA: Verificar si la fecha de la reservación ya pasó
  yaExpiro() {
    const ahora = new Date();
    const fechaReserva = new Date(`${this.fechaReserva}T${this.horaReserva}`);
    return ahora > fechaReserva;
  }
}

module.exports = Reservation;
