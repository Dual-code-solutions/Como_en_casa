// scripts/test-endpoints.js — Prueba rápida de endpoints principales
require('dotenv').config();

const BASE = 'http://localhost:3000/api';

async function test() {
  console.log('═══════════════════════════════════════');
  console.log('  🧪 TEST DE ENDPOINTS');
  console.log('═══════════════════════════════════════\n');

  // ── 1. LOGIN ──
  console.log('1️⃣  POST /api/auth/login');
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@tudominio.com',
      password: 'Password123'
    })
  });
  const loginData = await loginRes.json();
  console.log(`   Status: ${loginRes.status} — ${loginData.success ? '✅' : '❌'}`);
  if (!loginData.success) { console.log('   ❌ Login falló, no se puede continuar'); process.exit(1); }
  
  const TOKEN = loginData.data.token;
  const userId = loginData.data.user.id;
  console.log(`   Token: ${TOKEN.substring(0, 30)}...`);
  console.log(`   User:  ${loginData.data.user.nombre} (${loginData.data.user.rol})\n`);

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}`
  };

  // ── 2. GET ME ──
  console.log('2️⃣  GET /api/auth/me');
  const meRes = await fetch(`${BASE}/auth/me`, { headers: authHeaders });
  const meData = await meRes.json();
  console.log(`   Status: ${meRes.status} — ${meData.success ? '✅' : '❌'}`);
  if (meData.data) console.log(`   Perfil: ${meData.data.primerNombre} ${meData.data.primerApellido}\n`);

  // ── 3. LISTAR USUARIOS ──
  console.log('3️⃣  GET /api/users');
  const usersRes = await fetch(`${BASE}/users`, { headers: authHeaders });
  const usersData = await usersRes.json();
  console.log(`   Status: ${usersRes.status} — ${usersData.success ? '✅' : '❌'}`);
  console.log(`   Total usuarios: ${usersData.data?.length || 0}\n`);

  // ── 4. LISTAR LOCALES ──
  console.log('4️⃣  GET /api/locales');
  const localesRes = await fetch(`${BASE}/locales`, { headers: authHeaders });
  const localesData = await localesRes.json();
  console.log(`   Status: ${localesRes.status} — ${localesData.success ? '✅' : '❌'}`);
  console.log(`   Total locales: ${localesData.data?.length || 0}\n`);

  // ── 5. CREAR LOCAL ──
  console.log('5️⃣  POST /api/locales (crear sucursal de prueba)');
  const createLocalRes = await fetch(`${BASE}/locales`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      nombreSucursal: 'Test Sucursal',
      slug: 'test-sucursal'
    })
  });
  const createLocalData = await createLocalRes.json();
  console.log(`   Status: ${createLocalRes.status} — ${createLocalData.success ? '✅' : '❌'}`);
  
  let localId = null;
  if (createLocalData.data?.id) {
    localId = createLocalData.data.id;
    console.log(`   Local ID: ${localId}\n`);
  } else {
    console.log(`   Error: ${createLocalData.error || JSON.stringify(createLocalData)}\n`);
  }

  if (!localId) {
    // Intentar obtener uno existente
    if (localesData.data?.length > 0) {
      localId = localesData.data[0].id;
      console.log(`   Usando local existente: ${localId}\n`);
    } else {
      console.log('   ⚠️  No hay locales, saltando tests de mesas/categorías/productos\n');
    }
  }

  if (localId) {
    // ── 6. LISTAR MESAS ──
    console.log('6️⃣  GET /api/locales/:localId/mesas (público)');
    const mesasRes = await fetch(`${BASE}/locales/${localId}/mesas`);
    const mesasData = await mesasRes.json();
    console.log(`   Status: ${mesasRes.status} — ${mesasData.success ? '✅' : '❌'}`);
    console.log(`   Total mesas: ${mesasData.data?.length || 0}\n`);

    // ── 7. LISTAR CATEGORÍAS ──
    console.log('7️⃣  GET /api/locales/:localId/categorias (público)');
    const catRes = await fetch(`${BASE}/locales/${localId}/categorias`);
    const catData = await catRes.json();
    console.log(`   Status: ${catRes.status} — ${catData.success ? '✅' : '❌'}`);
    console.log(`   Total categorías: ${catData.data?.length || 0}\n`);

    // ── 8. LISTAR PRODUCTOS ──
    console.log('8️⃣  GET /api/locales/:localId/productos (público)');
    const prodRes = await fetch(`${BASE}/locales/${localId}/productos`);
    const prodData = await prodRes.json();
    console.log(`   Status: ${prodRes.status} — ${prodData.success ? '✅' : '❌'}`);
    console.log(`   Total productos: ${prodData.data?.length || 0}\n`);

    // ── 9. LISTAR CORTES ──
    console.log('9️⃣  GET /api/locales/:localId/cortes (auth)');
    const cortesRes = await fetch(`${BASE}/locales/${localId}/cortes`, { headers: authHeaders });
    const cortesData = await cortesRes.json();
    console.log(`   Status: ${cortesRes.status} — ${cortesData.success ? '✅' : '❌'}`);
    console.log(`   Total cortes: ${cortesData.data?.length || 0}\n`);

    // ── LIMPIAR: Borrar local de prueba ──
    if (createLocalData.success) {
      console.log('🧹 Limpiando: DELETE /api/locales/:id');
      const delRes = await fetch(`${BASE}/locales/${localId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const delData = await delRes.json();
      console.log(`   Status: ${delRes.status} — ${delData.success ? '✅' : '❌'}\n`);
    }
  }

  // ── 10. LISTAR PEDIDOS ──
  console.log('🔟 GET /api/orders (auth + paginación)');
  const ordersRes = await fetch(`${BASE}/orders`, { headers: authHeaders });
  const ordersData = await ordersRes.json();
  console.log(`   Status: ${ordersRes.status} — ${ordersData.success ? '✅' : '❌'}\n`);

  // ── 11. LISTAR RESERVACIONES ──
  console.log('1️⃣1️⃣ GET /api/reservaciones (auth)');
  const resRes = await fetch(`${BASE}/reservaciones`, { headers: authHeaders });
  const resData = await resRes.json();
  console.log(`   Status: ${resRes.status} — ${resData.success ? '✅' : '❌'}\n`);

  // ── 12. SIN TOKEN → 401 ──
  console.log('1️⃣2️⃣ GET /api/users SIN TOKEN → debe ser 401');
  const noAuthRes = await fetch(`${BASE}/users`);
  console.log(`   Status: ${noAuthRes.status} — ${noAuthRes.status === 401 ? '✅' : '❌'}\n`);

  // ── 13. HEALTH CHECK ──
  console.log('1️⃣3️⃣ GET /api/health');
  const healthRes = await fetch(`${BASE}/health`);
  const healthData = await healthRes.json();
  console.log(`   Status: ${healthRes.status} — ${healthData.success ? '✅' : '❌'}\n`);

  console.log('═══════════════════════════════════════');
  console.log('  🏁 TEST COMPLETO');
  console.log('═══════════════════════════════════════');

  process.exit(0);
}

test().catch(e => { console.error('❌ Error fatal:', e.message); process.exit(1); });
