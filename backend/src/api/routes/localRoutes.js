// src/api/routes/localRoutes.js
const { Router } = require('express');
const validate = require('../middlewares/validate');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const { createLocalSchema, updateLocalSchema } = require('../dtos/localSchemas');

function localRoutes(localController) {
  const router = Router();

  // Todas las rutas de locales requieren autenticación
  router.use(authMiddleware);

  // #09 GET /api/locales — 🔴 solo dueño (ver lista de sucursales)
  router.get('/', requireRole('dueño'), localController.list);

  // #10 GET /api/locales/:id — 🔴🟡 dueño cualquier, admin solo el suyo
  router.get('/:id', requireRole('dueño', 'admin'), localController.get);

  // #11 POST /api/locales — 🔴 solo dueño
  router.post('/', requireRole('dueño'), validate(createLocalSchema), localController.create);

  // #12 PATCH /api/locales/:id — 🔴 solo dueño
  router.patch('/:id', requireRole('dueño'), validate(updateLocalSchema), localController.update);

  // #13 DELETE /api/locales/:id — 🔴 solo dueño
  router.delete('/:id', requireRole('dueño'), localController.delete);

  return router;
}

module.exports = localRoutes;
