// src/api/dtos/corteSchemas.js
// ─────────────────────────────────────────────────────
// No se necesita schema de creación porque el backend
// calcula todo automáticamente (totales, conteos, etc.)
// El body del POST /api/locales/:localId/cortes es vacío.
//
// Solo se exporta un schema de query params para filtrar.
// ─────────────────────────────────────────────────────
const { z } = require('zod');

const cortesQuerySchema = z.object({
  desde: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido. Usar YYYY-MM-DD')
    .optional(),
  hasta: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido. Usar YYYY-MM-DD')
    .optional()
});

module.exports = { cortesQuerySchema };
