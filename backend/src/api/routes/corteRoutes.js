// src/api/routes/corteRoutes.js
const { Router } = require('express');
const validate = require('../middlewares/validate');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const localGuard = require('../middlewares/localGuard');
const { cortesQuerySchema } = require('../dtos/corteSchemas');

function corteRoutes(corteController) {
  const router = Router({ mergeParams: true });

  // Todas las rutas de cortes requieren auth + rol
  router.use(authMiddleware);
  router.use(requireRole('dueño', 'admin'));
  router.use(localGuard);

  // #39 POST /api/locales/:localId/cortes — 🔴🟡 (cierre de caja)
  router.post('/', corteController.generate);

  // #40 GET /api/locales/:localId/cortes — 🔴🟡 (historial)
  router.get('/', validate(cortesQuerySchema, 'query'), corteController.list);

  // #41 GET /api/locales/:localId/cortes/:id — 🔴🟡 (detalle)
  router.get('/:id', corteController.get);

  return router;
}

module.exports = corteRoutes;
