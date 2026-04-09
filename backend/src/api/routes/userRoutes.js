// src/api/routes/userRoutes.js
const { Router } = require('express');
const validate = require('../middlewares/validate');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const { createUserSchema, updateUserSchema } = require('../dtos/userSchemas');

function userRoutes(userController) {
  const router = Router();

  // Todas las rutas de usuarios requieren autenticación
  router.use(authMiddleware);

  // #04 GET /api/users — 🔴🟡 dueño ve todos, admin ve los de su local
  router.get('/', requireRole('dueño', 'admin'), userController.list);

  // #05 GET /api/users/:id — 🔴🟡
  router.get('/:id', requireRole('dueño', 'admin'), userController.get);

  // #06 POST /api/users — 🔴 solo dueño
  router.post('/', requireRole('dueño'), validate(createUserSchema), userController.create);

  // #07 PATCH /api/users/:id — 🔴🟡 dueño edita cualquier, admin su propio perfil
  router.patch('/:id', requireRole('dueño', 'admin'), validate(updateUserSchema), userController.update);

  // #08 PATCH /api/users/:id/toggle-status — 🔴 solo dueño
  router.patch('/:id/toggle-status', requireRole('dueño'), userController.toggleStatus);

  return router;
}

module.exports = userRoutes;
