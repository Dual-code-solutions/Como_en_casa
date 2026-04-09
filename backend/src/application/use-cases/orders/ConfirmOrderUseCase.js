// src/application/use-cases/orders/ConfirmOrderUseCase.js
const Order = require('../../../domain/entities/Order');

class ConfirmOrderUseCase {
  constructor({ orderRepository, mesaRepository, socketIO }) {
    this.orderRepo = orderRepository;
    this.mesaRepo  = mesaRepository;
    this.io        = socketIO;
  }

  async execute({ localId, customer, cart, total, deliveryType }) {
    // Validar modalidad
    Order.validarModalidad(deliveryType);

    // 1. Si es pedido local con mesa, verificar que exista
    let mesaId = null;
    if (customer.table && deliveryType === 'local') {
      const mesa = await this.mesaRepo.findById(customer.table);
      if (!mesa) throw new Error('Mesa no encontrada');
      mesaId = mesa.id;
    }

    // 2. Crear la entidad Order
    const order = new Order({
      localId,
      mesaId,
      nombreCliente:       customer.name,
      telefono:            customer.phone,
      modalidad:           deliveryType,
      direccionEnvio:      customer.address || null,
      referenciaUbicacion: customer.landmark || null,
      items:               cart,
      total
    });

    // 3. Persistir pedido + detalle
    const savedOrder = await this.orderRepo.save(order);

    // 4. Si tiene mesa, marcarla como ocupada
    if (mesaId) {
      await this.mesaRepo.updateEstado(mesaId, 'ocupada');
      this.io.to(localId).emit('mesa_updated', {
        mesaId,
        estado_actual: 'ocupada'
      });
    }

    // 5. Notificar al admin por WebSocket
    this.io.to(localId).emit('new_order', {
      orderId:      savedOrder.id,
      customer:     { name: customer.name, table: mesaId },
      deliveryType,
      total,
      mesa:         mesaId
    });

    return savedOrder;
  }
}

module.exports = ConfirmOrderUseCase;
