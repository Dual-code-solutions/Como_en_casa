// src/api/routes/categoriaRoutes.js
const { Router } = require('express');
const validate = require('../middlewares/validate');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const localGuard = require('../middlewares/localGuard');
const { createCategoriaSchema, updateCategoriaSchema } = require('../dtos/categoriaSchemas');

function categoriaRoutes(categoriaController) {
  const router = Router({ mergeParams: true });

  // #19 GET /api/locales/:localId/categorias — 🟢 público (tablet)
  router.get('/', categoriaController.list);

  // #20 POST /api/locales/:localId/categorias — 🔴🟡
  router.post('/',
    authMiddleware, requireRole('dueño', 'admin'), localGuard,
    validate(createCategoriaSchema), categoriaController.create
  );

  // #21 PATCH /api/locales/:localId/categorias/:id — 🔴🟡
  router.patch('/:id',
    authMiddleware, requireRole('dueño', 'admin'), localGuard,
    validate(updateCategoriaSchema), categoriaController.update
  );

  // #22 DELETE /api/locales/:localId/categorias/:id — 🔴 solo dueño
  router.delete('/:id',
    authMiddleware, requireRole('dueño'), categoriaController.delete
  );

  return router;
}

module.exports = categoriaRoutes;
