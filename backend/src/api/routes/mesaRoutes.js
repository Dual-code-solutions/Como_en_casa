// src/api/routes/mesaRoutes.js
const { Router } = require('express');
const validate = require('../middlewares/validate');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const localGuard = require('../middlewares/localGuard');
const { createMesaSchema, updateMesaSchema, updateEstadoMesaSchema } = require('../dtos/mesaSchemas');

function mesaRoutes(mesaController) {
  // mergeParams: true permite leer :localId de la ruta padre
  const router = Router({ mergeParams: true });

  // #14 GET /api/locales/:localId/mesas — 🟢 público (tablet del cliente)
  router.get('/', mesaController.list);

  // ── Desde aquí, todo requiere autenticación ──
  // #15 POST /api/locales/:localId/mesas — 🔴🟡
  router.post('/',
    authMiddleware, requireRole('dueño', 'admin'), localGuard,
    validate(createMesaSchema), mesaController.create
  );

  // #16 PATCH /api/locales/:localId/mesas/:id — 🔴🟡
  router.patch('/:id',
    authMiddleware, requireRole('dueño', 'admin'), localGuard,
    validate(updateMesaSchema), mesaController.update
  );

  // #17 PATCH /api/locales/:localId/mesas/:id/estado — 🔴🟡
  router.patch('/:id/estado',
    authMiddleware, requireRole('dueño', 'admin'), localGuard,
    validate(updateEstadoMesaSchema), mesaController.updateEstado
  );

  // #18 DELETE /api/locales/:localId/mesas/:id — 🔴 solo dueño
  router.delete('/:id',
    authMiddleware, requireRole('dueño'), mesaController.delete
  );

  return router;
}

module.exports = mesaRoutes;
