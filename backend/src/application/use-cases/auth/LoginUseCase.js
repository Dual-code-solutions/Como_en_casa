// src/application/use-cases/auth/LoginUseCase.js
const { createClient } = require('@supabase/supabase-js');
const supabase = require('../../../infrastructure/config/supabase');
const jwt = require('jsonwebtoken');

// Cliente con ANON KEY solo para autenticación (signInWithPassword)
// El cliente principal (Service Role) se usa para queries de datos
const authClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

class LoginUseCase {
  async execute({ email, password }) {
    // 1. Autenticar contra Supabase Auth (con ANON KEY)
    const { data, error } = await authClient.auth.signInWithPassword({ email, password });
    if (error) throw new Error('Credenciales incorrectas');

    // 2. Obtener perfil del usuario (con SERVICE ROLE KEY - bypass RLS)
    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (perfilError || !perfil) throw new Error('Perfil no encontrado');
    if (!perfil.estado_cuenta) throw new Error('Cuenta desactivada');

    // 3. Generar JWT propio del backend
    const token = jwt.sign(
      {
        userId:  perfil.id,
        rol:     perfil.rol,
        localId: perfil.id_local,
        nombre:  perfil.primer_nombre
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return {
      token,
      user: {
        id:       perfil.id,
        rol:      perfil.rol,
        id_local: perfil.id_local,
        nombre:   `${perfil.primer_nombre} ${perfil.primer_apellido}`
      }
    };
  }
}

module.exports = LoginUseCase;

