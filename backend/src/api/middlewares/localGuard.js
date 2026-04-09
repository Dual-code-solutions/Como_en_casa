// src/api/middlewares/localGuard.js
// ─────────────────────────────────────────────────────
// Middleware de Protección de Local
// Verifica que un admin solo pueda operar sobre datos
// de SU propia sucursal. El dueño puede operar en cualquiera.
//
// Se usa en rutas bajo /api/locales/:localId/...
// ─────────────────────────────────────────────────────

function localGuard(req, res, next) {
  // El dueño tiene acceso total, no necesita restricción
  if (req.userRole === 'dueño') return next();

  // Obtener el localId del param de la URL
  const localIdDelParam = req.params.localId;

  if (localIdDelParam && localIdDelParam !== req.userLocalId) {
    return res.status(403).json({
      success: false,
      error: 'No tienes acceso a este local'
    });
  }

  next();
}

module.exports = localGuard;
