// src/api/middlewares/validate.js
// ─────────────────────────────────────────────────────
// Middleware de Validación con Zod
// Valida req.body, req.query o req.params contra un
// schema Zod. Si falla, responde 400 con errores claros.
//
// Uso en rutas:
//   validate(confirmOrderSchema)           → valida body
//   validate(schema, 'query')              → valida query params
// ─────────────────────────────────────────────────────

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const dataToValidate = req[source];
    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      // Zod v4 usa .issues, Zod v3 usa .errors
      const issues = result.error.issues || result.error.errors || [];
      return res.status(400).json({
        success: false,
        errors: issues.map(e => ({
          field:   e.path.join('.'),
          message: e.message
        }))
      });
    }

    // Reemplazar con datos limpios y tipados
    req[source] = result.data;
    next();
  };
}

module.exports = validate;
