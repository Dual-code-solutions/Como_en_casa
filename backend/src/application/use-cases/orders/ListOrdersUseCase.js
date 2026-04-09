// src/application/use-cases/orders/ListOrdersUseCase.js

class ListOrdersUseCase {
  constructor({ orderRepository }) {
    this.orderRepo = orderRepository;
  }

  async execute({ localId, estado, fecha, page, limit }) {
    return this.orderRepo.findAll({ localId, estado, fecha, page, limit });
  }
}

module.exports = ListOrdersUseCase;
