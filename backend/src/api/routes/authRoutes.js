// src/api/routes/authRoutes.js
const { Router } = require('express');
const validate = require('../middlewares/validate');
const authMiddleware = require('../middlewares/authMiddleware');
const { loginSchema } = require('../dtos/authSchemas');

function authRoutes(authController) {
  const router = Router();

  // #01 POST /api/auth/login — 🟢 público
  router.post('/login', validate(loginSchema), authController.login);

  // #02 POST /api/auth/logout — 🔴🟡 autenticado
  router.post('/logout', authMiddleware, authController.logout);

  // #03 GET /api/auth/me — 🔴🟡 autenticado
  router.get('/me', authMiddleware, authController.me);

  return router;
}

module.exports = authRoutes;
