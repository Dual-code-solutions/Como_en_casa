// src/api/middlewares/roleMiddleware.js
// ─────────────────────────────────────────────────────
// Middleware de Autorización por Rol
// Verifica que el usuario autenticado tenga uno de los
// roles permitidos para acceder al endpoint.
//
// Uso en rutas:
//   requireRole('dueño')           → Solo dueños
//   requireRole('admin', 'dueño')  → Admin o dueño
// ─────────────────────────────────────────────────────

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        error: `Acceso restringido. Roles permitidos: ${roles.join(', ')}`
      });
    }

    next();
  };
}

module.exports = { requireRole };
