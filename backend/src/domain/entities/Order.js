// src/domain/entities/Order.js
// ─────────────────────────────────────────────────────
// Entidad: Pedido
// Representa un pedido del restaurante con sus reglas de negocio.
// NO importa Supabase, Express ni ninguna librería externa.
// ─────────────────────────────────────────────────────

class Order {
  // Estados válidos del flujo de un pedido
  static ESTADOS = ['entrante', 'cocina', 'listo', 'finalizado', 'cancelado'];

  // Mapa de transiciones: de qué estado puedes ir a cuál
  static FLUJO = {
    entrante: 'cocina',
    cocina: 'listo',
    listo: 'finalizado'
  };

  // Modalidades de entrega válidas
  static MODALIDADES = ['local', 'domicilio', 'llevar'];

  constructor({ id, localId, mesaId, nombreCliente, telefono,
                modalidad, direccionEnvio, referenciaUbicacion,
                items = [], total, estado = 'entrante',
                numOrdenDia, tiempoEsperaMinutos, creadoAt }) {
    this.id                  = id;
    this.localId             = localId;
    this.mesaId              = mesaId || null;
    this.nombreCliente       = nombreCliente;
    this.telefono            = telefono;
    this.modalidad           = modalidad;
    this.direccionEnvio      = direccionEnvio || null;
    this.referenciaUbicacion = referenciaUbicacion || null;
    this.items               = items;
    this.total               = total;
    this.estado              = estado;
    this.numOrdenDia         = numOrdenDia || null;
    this.tiempoEsperaMinutos = tiempoEsperaMinutos || null;
    this.creadoAt            = creadoAt || new Date();
  }

  // REGLA: Avanzar al siguiente estado del flujo Kanban
  // entrante → cocina → listo → finalizado
  avanzarEstado() {
    const siguiente = Order.FLUJO[this.estado];
    if (!siguiente) {
      throw new Error(`No se puede avanzar desde el estado: ${this.estado}`);
    }
    this.estado = siguiente;
    return this;
  }

  // REGLA: Solo se puede cancelar si aún no entró a cocina
  cancelar() {
    if (this.estado !== 'entrante') {
      throw new Error('Solo se puede cancelar un pedido entrante');
    }
    this.estado = 'cancelado';
    return this;
  }

  // REGLA: Verificar si el pedido requiere una mesa (modalidad local)
  requiereMesa() {
    return this.modalidad === 'local';
  }

  // REGLA: Verificar si el pedido requiere dirección (modalidad domicilio)
  requiereDireccion() {
    return this.modalidad === 'domicilio';
  }

  // REGLA: Un pedido está activo si no ha sido finalizado ni cancelado
  estaActivo() {
    return !['finalizado', 'cancelado'].includes(this.estado);
  }

  // REGLA: Calcular el total sumando los subtotales de los items
  calcularTotal() {
    return this.items.reduce((sum, item) => {
      return sum + (item.subtotal * (item.quantity || 1));
    }, 0);
  }

  // REGLA: Validar que la modalidad sea una de las permitidas
  static validarModalidad(modalidad) {
    if (!Order.MODALIDADES.includes(modalidad)) {
      throw new Error(`Modalidad inválida: ${modalidad}. Debe ser: ${Order.MODALIDADES.join(', ')}`);
    }
  }
}

module.exports = Order;
