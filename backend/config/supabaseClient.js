// Configuración del cliente de Supabase para el backend
// Usamos SERVICE_ROLE para saltarnos RLS y tener acceso completo
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE
);

module.exports = supabase;
