// src/api/controllers/OrderController.js

class OrderController {
  constructor({ confirmOrderUseCase, listOrdersUseCase,
                getOrderUseCase, updateOrderEstadoUseCase }) {
    this._confirmOrder  = confirmOrderUseCase;
    this._listOrders    = listOrdersUseCase;
    this._getOrder      = getOrderUseCase;
    this._updateEstado  = updateOrderEstadoUseCase;

    this.confirmOrder = this.confirmOrder.bind(this);
    this.listOrders   = this.listOrders.bind(this);
    this.getOrder     = this.getOrder.bind(this);
    this.updateEstado = this.updateEstado.bind(this);
  }

  // #32 POST /api/orders/confirm
  async confirmOrder(req, res, next) {
    try {
      const order = await this._confirmOrder.execute(req.body);
      res.status(201).json({ success: true, data: { orderId: order.id } });
    } catch (e) { next(e); }
  }

  // #33 GET /api/orders
  async listOrders(req, res, next) {
    try {
      // Admin solo ve su local, dueño puede filtrar por query
      const localId = req.userRole === 'admin'
        ? req.userLocalId
        : req.query.localId;

      const { page, limit } = req.pagination;
      const result = await this._listOrders.execute({
        localId,
        estado: req.query.estado,
        fecha:  req.query.fecha,
        page,
        limit
      });
      res.json({ success: true, ...result });
    } catch (e) { next(e); }
  }

  // #34 GET /api/orders/:id
  async getOrder(req, res, next) {
    try {
      const order = await this._getOrder.execute({
        orderId: req.params.id
      });
      res.json({ success: true, data: order });
    } catch (e) { next(e); }
  }

  // #35 PATCH /api/orders/:id/estado
  async updateEstado(req, res, next) {
    try {
      const order = await this._updateEstado.execute({
        orderId:     req.params.id,
        nuevoEstado: req.body.estado,
        userRole:    req.userRole,
        userLocalId: req.userLocalId
      });
      res.json({ success: true, data: order });
    } catch (e) { next(e); }
  }
}

module.exports = OrderController;
