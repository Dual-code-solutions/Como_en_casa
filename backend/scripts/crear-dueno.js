// Script temporal: Crear/recrear el usuario dueño maestro
// Ejecutar con: node scripts/crear-dueno.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function crearDueno() {
  const EMAIL    = 'serviciodualcodesolutions.devs@gmail.com';
  const PASSWORD = 'ServiciosDualcode';

  // Paso 1: Buscar si el email ya existe en Auth
  console.log('🔍 Buscando usuario existente...');
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const existing = users.find(u => u.email === EMAIL);

  if (existing) {
    console.log(`   ⚠️  Usuario encontrado: ${existing.id}`);
    console.log('🔄 Eliminando perfil + usuario Auth...');
    await supabase.from('perfiles').delete().eq('id', existing.id);
    await supabase.auth.admin.deleteUser(existing.id);
    console.log('   ✅ Eliminado. Esperando 2s...');
    await new Promise(r => setTimeout(r, 2000));
  }

  // Paso 2: Crear usuario nuevo
  console.log('🔄 Creando usuario en Supabase Auth...');
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { rol: 'dueño' }
  });

  if (authError) {
    console.error('❌ Error:', authError.message);
    process.exit(1);
  }

  const userId = authUser.user.id;
  console.log(`   ✅ Auth user creado: ${userId}`);

  // Paso 3: Crear perfil
  console.log('🔄 Creando perfil...');
  const { error: perfilError } = await supabase
    .from('perfiles')
    .insert({
      id:                userId,
      id_local:          null,
      rol:               'dueño',
      primer_nombre:     'Dual',
      primer_apellido:   'Code',
      telefono_contacto: '0000000000',
      estado_cuenta:     true
    });

  if (perfilError) {
    console.error('❌ Error perfil:', perfilError.message);
    process.exit(1);
  }

  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('  ✅ USUARIO DUEÑO CREADO');
  console.log('═══════════════════════════════════════');
  console.log(`  📧 Email:      ${EMAIL}`);
  console.log(`  🔑 Contraseña: ${PASSWORD}`);
  console.log(`  🆔 ID:         ${userId}`);
  console.log(`  👤 Rol:        dueño`);
  console.log('═══════════════════════════════════════');

  process.exit(0);
}

crearDueno();
