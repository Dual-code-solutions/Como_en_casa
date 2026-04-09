// src/application/use-cases/orders/UpdateOrderEstadoUseCase.js

class UpdateOrderEstadoUseCase {
  constructor({ orderRepository, mesaRepository, socketIO }) {
    this.orderRepo = orderRepository;
    this.mesaRepo  = mesaRepository;
    this.io        = socketIO;
  }

  async execute({ orderId, nuevoEstado, userLocalId, userRole }) {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new Error('Pedido no encontrado');

    // Admin solo puede manejar pedidos de su local
    if (userRole === 'admin' && order.localId !== userLocalId) {
      throw new Error('Sin permisos para este pedido');
    }

    // Actualizar estado en BD
    const updated = await this.orderRepo.updateEstado(orderId, nuevoEstado);

    // Si se finalizó y tenía mesa, verificar si se puede liberar
    if (nuevoEstado === 'finalizado' && order.mesaId) {
      const activosEnMesa = await this.orderRepo.countActivosPorMesa(order.mesaId);

      if (activosEnMesa === 0) {
        await this.mesaRepo.updateEstado(order.mesaId, 'disponible');
        this.io.to(order.localId).emit('mesa_updated', {
          mesaId: order.mesaId,
          estado_actual: 'disponible'
        });
      }
    }

    // Notificar cambio de estado al room del local
    this.io.to(order.localId).emit('order_updated', {
      orderId,
      nuevoEstado
    });

    return updated;
  }
}

module.exports = UpdateOrderEstadoUseCase;
