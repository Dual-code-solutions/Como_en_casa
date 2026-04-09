// src/api/routes/reservacionRoutes.js
const { Router } = require('express');
const validate = require('../middlewares/validate');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const { createReservacionSchema, updateReservacionSchema } = require('../dtos/reservacionSchemas');

function reservacionRoutes(reservacionController) {
  const router = Router();

  // #36 POST /api/reservaciones — 🟢 público (formulario web del cliente)
  router.post('/', validate(createReservacionSchema), reservacionController.create);

  // #37 GET /api/reservaciones — 🔴🟡 (panel admin)
  router.get('/',
    authMiddleware, requireRole('dueño', 'admin'),
    reservacionController.list
  );

  // #38 PATCH /api/reservaciones/:id — 🔴🟡 (aceptar, cancelar, anticipo)
  router.patch('/:id',
    authMiddleware, requireRole('dueño', 'admin'),
    validate(updateReservacionSchema), reservacionController.update
  );

  return router;
}

module.exports = reservacionRoutes;
