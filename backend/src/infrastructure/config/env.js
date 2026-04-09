// src/infrastructure/config/env.js
// ─────────────────────────────────────────────────────
// Validación de variables de entorno.
// Si falta alguna variable OBLIGATORIA, el servidor NO arranca.
// Esto evita errores silenciosos en producción.
// ─────────────────────────────────────────────────────

const REQUIRED_VARS = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET'
];

function validateEnv() {
  const missing = REQUIRED_VARS.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('═══════════════════════════════════════════════');
    console.error('  ❌ VARIABLES DE ENTORNO FALTANTES:');
    missing.forEach(key => console.error(`     → ${key}`));
    console.error('  Revisa tu archivo .env');
    console.error('═══════════════════════════════════════════════');
    process.exit(1);
  }
}

module.exports = { validateEnv };
