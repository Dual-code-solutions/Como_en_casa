// src/application/use-cases/orders/GetOrderUseCase.js

class GetOrderUseCase {
  constructor({ orderRepository }) {
    this.orderRepo = orderRepository;
  }

  async execute({ orderId }) {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new Error('Pedido no encontrado');
    return order;
  }
}

module.exports = GetOrderUseCase;
