// src/api/routes/orderRoutes.js
const { Router } = require('express');
const validate = require('../middlewares/validate');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const paginate = require('../middlewares/paginate');
const { confirmOrderSchema, updateEstadoSchema } = require('../dtos/orderSchemas');

function orderRoutes(orderController) {
  const router = Router();

  // #32 POST /api/orders/confirm — 🟢 público (tablet del cliente)
  router.post('/confirm', validate(confirmOrderSchema), orderController.confirmOrder);

  // #33 GET /api/orders — 🔴🟡 (panel admin/Kanban)
  router.get('/',
    authMiddleware, requireRole('dueño', 'admin'),
    paginate, orderController.listOrders
  );

  // #34 GET /api/orders/:id — 🟢 Público (clientes para rastrear) o 🔴🟡 (admin)
  router.get('/:id', orderController.getOrder);

  // #35 PATCH /api/orders/:id/estado — 🔴🟡 (avanzar en el Kanban)
  router.patch('/:id/estado',
    authMiddleware, requireRole('dueño', 'admin'),
    validate(updateEstadoSchema), orderController.updateEstado
  );

  return router;
}

module.exports = orderRoutes;
