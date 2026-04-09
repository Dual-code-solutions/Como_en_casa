// src/api/routes/productoRoutes.js
const { Router } = require('express');
const validate = require('../middlewares/validate');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const localGuard = require('../middlewares/localGuard');
const {
  createProductoSchema, updateProductoSchema,
  toggleDisponibilidadSchema,
  addIngredienteSchema, updateIngredienteSchema
} = require('../dtos/productoSchemas');

function productoRoutes(productoController) {
  const router = Router({ mergeParams: true });

  // #23 GET /api/locales/:localId/productos — 🟢 público (tablet)
  router.get('/', productoController.list);

  // #24 GET /api/locales/:localId/productos/:id — 🟢 público (tablet modal)
  router.get('/:id', productoController.get);

  // #25 POST /api/locales/:localId/productos — 🔴🟡
  router.post('/',
    authMiddleware, requireRole('dueño', 'admin'), localGuard,
    validate(createProductoSchema), productoController.create
  );

  // #26 PATCH /api/locales/:localId/productos/:id — 🔴🟡
  router.patch('/:id',
    authMiddleware, requireRole('dueño', 'admin'), localGuard,
    validate(updateProductoSchema), productoController.update
  );

  // #27 PATCH /api/locales/:localId/productos/:id/disponibilidad — 🔴🟡
  router.patch('/:id/disponibilidad',
    authMiddleware, requireRole('dueño', 'admin'), localGuard,
    validate(toggleDisponibilidadSchema), productoController.toggleDisponibilidad
  );

  // #28 DELETE /api/locales/:localId/productos/:id — 🔴
  router.delete('/:id',
    authMiddleware, requireRole('dueño'), productoController.delete
  );

  // ── INGREDIENTES (sub-recurso de producto) ──

  // #29 POST /api/locales/:localId/productos/:productoId/ingredientes — 🔴🟡
  router.post('/:productoId/ingredientes',
    authMiddleware, requireRole('dueño', 'admin'), localGuard,
    validate(addIngredienteSchema), productoController.addIngrediente
  );

  // #30 PATCH /api/locales/:localId/productos/:productoId/ingredientes/:id — 🔴🟡
  router.patch('/:productoId/ingredientes/:id',
    authMiddleware, requireRole('dueño', 'admin'), localGuard,
    validate(updateIngredienteSchema), productoController.updateIngrediente
  );

  // #31 DELETE /api/locales/:localId/productos/:productoId/ingredientes/:id — 🔴
  router.delete('/:productoId/ingredientes/:id',
    authMiddleware, requireRole('dueño'), productoController.deleteIngrediente
  );

  return router;
}

module.exports = productoRoutes;
