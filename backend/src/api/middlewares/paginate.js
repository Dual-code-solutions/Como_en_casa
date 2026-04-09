// src/api/middlewares/paginate.js
// ─────────────────────────────────────────────────────
// Middleware de Paginación
// Estandariza page y limit en todos los endpoints de listado.
// Lee de query params: ?page=2&limit=10
//
// Valores por defecto: page=1, limit=30
// Límite máximo: 100 (para evitar consultas gigantes)
// ─────────────────────────────────────────────────────

function paginate(req, res, next) {
  const page  = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 30));

  req.pagination = {
    page,
    limit,
    offset: (page - 1) * limit
  };

  next();
}

module.exports = paginate;
