// src/infrastructure/config/supabase.js
// ─────────────────────────────────────────────────────
// Una sola instancia del cliente Supabase para todo el backend.
// Usa SERVICE_ROLE_KEY porque este es el servidor (bypass de RLS).
// NUNCA usar esta key en el frontend.
// ─────────────────────────────────────────────────────

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = supabase;
