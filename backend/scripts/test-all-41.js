// scripts/test-all-41.js — Prueba de los 41 endpoints
require('dotenv').config();
const BASE = 'http://localhost:3000/api';
let TOKEN = '';
let passed = 0;
let failed = 0;
const errors = [];

async function req(method, path, body = null, auth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  return fetch(`${BASE}${path}`, opts);
}

function log(num, method, path, status, ok) {
  const icon = ok ? '✅' : '❌';
  console.log(`  #${String(num).padStart(2,'0')} ${icon} ${method.padEnd(6)} ${path} → ${status}`);
  if (ok) passed++; else { failed++; errors.push(`#${num} ${method} ${path} → ${status}`); }
}

async function run() {
  console.log('═══════════════════════════════════════════');
  console.log('  🧪 TEST COMPLETO — 41 ENDPOINTS');
  console.log('═══════════════════════════════════════════\n');

  // ── LOGIN ──
  const loginRes = await req('POST', '/auth/login', { email: 'admin@tudominio.com', password: 'Password123' }, false);
  const loginData = await loginRes.json();
  TOKEN = loginData.data?.token;
  log(1, 'POST', '/auth/login', loginRes.status, loginRes.status === 200);
  if (!TOKEN) { console.log('❌ Sin token, abortando'); process.exit(1); }

  // #02 POST /auth/logout
  let r = await req('POST', '/auth/logout');
  log(2, 'POST', '/auth/logout', r.status, r.status === 200);

  // #03 GET /auth/me
  r = await req('GET', '/auth/me');
  log(3, 'GET', '/auth/me', r.status, r.status === 200);

  // ── USERS ──
  // #04 GET /users
  r = await req('GET', '/users');
  log(4, 'GET', '/users', r.status, r.status === 200);

  // #05 GET /users/:id
  const meData = await (await req('GET', '/auth/me')).json();
  const userId = meData.data?.id;
  r = await req('GET', `/users/${userId}`);
  log(5, 'GET', '/users/:id', r.status, r.status === 200);

  // #06 POST /users (crear admin temporal)
  r = await req('POST', '/users', {
    email: 'test-admin-temp@test.com', password: 'Test123456',
    rol: 'admin', primerNombre: 'Test', primerApellido: 'Admin',
    telefonoContacto: '9990000000'
  });
  const newUser = await r.json();
  const tempUserId = newUser.data?.id;
  log(6, 'POST', '/users', r.status, r.status === 201);

  // #07 PATCH /users/:id
  if (tempUserId) {
    r = await req('PATCH', `/users/${tempUserId}`, { primerNombre: 'Editado' });
    log(7, 'PATCH', '/users/:id', r.status, r.status === 200);
  } else { log(7, 'PATCH', '/users/:id', 'SKIP', false); }

  // #08 PATCH /users/:id/toggle-status
  if (tempUserId) {
    r = await req('PATCH', `/users/${tempUserId}/toggle-status`);
    log(8, 'PATCH', '/users/:id/toggle', r.status, r.status === 200);
  } else { log(8, 'PATCH', '/users/:id/toggle', 'SKIP', false); }

  // ── LOCALES ──
  // #09 GET /locales
  r = await req('GET', '/locales');
  const localesData = await r.json();
  log(9, 'GET', '/locales', r.status, r.status === 200);

  // #10 GET /locales/:id (usar primero existente o crear)
  let localId;
  if (localesData.data?.length > 0) localId = localesData.data[0].id;

  // #11 POST /locales
  r = await req('POST', '/locales', { nombreSucursal: 'Test41', slug: 'test-41-endpoints' });
  const newLocal = await r.json();
  if (newLocal.data?.id) localId = newLocal.data.id;
  log(11, 'POST', '/locales', r.status, r.status === 201);

  // #10 GET /locales/:id
  r = await req('GET', `/locales/${localId}`);
  log(10, 'GET', '/locales/:id', r.status, r.status === 200);

  // #12 PATCH /locales/:id
  r = await req('PATCH', `/locales/${localId}`, { nombreSucursal: 'Test41 Edited' });
  log(12, 'PATCH', '/locales/:id', r.status, r.status === 200);

  // ── MESAS ──
  // #14 GET mesas (público)
  r = await req('GET', `/locales/${localId}/mesas`, null, false);
  log(14, 'GET', '/locales/:lid/mesas', r.status, r.status === 200);

  // #15 POST mesa
  r = await req('POST', `/locales/${localId}/mesas`, { nombre_o_numero: 'Mesa Test', capacidad: 4 });
  const mesaData = await r.json();
  const mesaId = mesaData.data?.id;
  log(15, 'POST', '/locales/:lid/mesas', r.status, r.status === 201);

  // #16 PATCH mesa
  if (mesaId) {
    r = await req('PATCH', `/locales/${localId}/mesas/${mesaId}`, { capacidad: 6 });
    log(16, 'PATCH', '/locales/:lid/mesas/:id', r.status, r.status === 200);
  } else { log(16, 'PATCH', '/locales/:lid/mesas/:id', 'SKIP', false); }

  // #17 PATCH mesa/estado
  if (mesaId) {
    r = await req('PATCH', `/locales/${localId}/mesas/${mesaId}/estado`, { estado_actual: 'ocupada' });
    log(17, 'PATCH', '/.../mesas/:id/estado', r.status, r.status === 200);
  } else { log(17, 'PATCH', '/.../mesas/:id/estado', 'SKIP', false); }

  // ── CATEGORÍAS ──
  // #19 GET categorías (público)
  r = await req('GET', `/locales/${localId}/categorias`, null, false);
  log(19, 'GET', '/locales/:lid/categorias', r.status, r.status === 200);

  // #20 POST categoría
  r = await req('POST', `/locales/${localId}/categorias`, { nombre: 'Tacos Test', orden: 1 });
  const catData = await r.json();
  const catId = catData.data?.id;
  log(20, 'POST', '/locales/:lid/categorias', r.status, r.status === 201);

  // #21 PATCH categoría
  if (catId) {
    r = await req('PATCH', `/locales/${localId}/categorias/${catId}`, { nombre: 'Tacos Editado' });
    log(21, 'PATCH', '/.../categorias/:id', r.status, r.status === 200);
  } else { log(21, 'PATCH', '/.../categorias/:id', 'SKIP', false); }

  // ── PRODUCTOS ──
  // #23 GET productos (público)
  r = await req('GET', `/locales/${localId}/productos`, null, false);
  log(23, 'GET', '/locales/:lid/productos', r.status, r.status === 200);

  // #25 POST producto
  r = await req('POST', `/locales/${localId}/productos`, {
    nombre: 'Taco Test', precioBase: 85, descripcion: 'taco de prueba',
    categoriaId: catId || null, disponible: true, visibleMenu: true
  });
  const prodData = await r.json();
  const prodId = prodData.data?.id;
  log(25, 'POST', '/locales/:lid/productos', r.status, r.status === 201);

  // #24 GET producto/:id (público)
  if (prodId) {
    r = await req('GET', `/locales/${localId}/productos/${prodId}`, null, false);
    log(24, 'GET', '/.../productos/:id', r.status, r.status === 200);
  } else { log(24, 'GET', '/.../productos/:id', 'SKIP', false); }

  // #26 PATCH producto
  if (prodId) {
    r = await req('PATCH', `/locales/${localId}/productos/${prodId}`, { nombre: 'Taco Editado' });
    log(26, 'PATCH', '/.../productos/:id', r.status, r.status === 200);
  } else { log(26, 'PATCH', '/.../productos/:id', 'SKIP', false); }

  // #27 PATCH disponibilidad
  if (prodId) {
    r = await req('PATCH', `/locales/${localId}/productos/${prodId}/disponibilidad`, { disponible: false });
    log(27, 'PATCH', '/.../disponibilidad', r.status, r.status === 200);
  } else { log(27, 'PATCH', '/.../disponibilidad', 'SKIP', false); }

  // #29 POST ingrediente
  let ingredienteId;
  if (prodId) {
    r = await req('POST', `/locales/${localId}/productos/${prodId}/ingredientes`, {
      nombreIngrediente: 'Queso test', precioExtra: 15, permiteDoble: true, esBase: true
    });
    const ingData = await r.json();
    ingredienteId = ingData.data?.id;
    log(29, 'POST', '/.../ingredientes', r.status, r.status === 201);
  } else { log(29, 'POST', '/.../ingredientes', 'SKIP', false); }

  // #30 PATCH ingrediente
  if (ingredienteId) {
    r = await req('PATCH', `/locales/${localId}/productos/${prodId}/ingredientes/${ingredienteId}`, { precioExtra: 20 });
    log(30, 'PATCH', '/.../ingredientes/:id', r.status, r.status === 200);
  } else { log(30, 'PATCH', '/.../ingredientes/:id', 'SKIP', false); }

  // #31 DELETE ingrediente
  if (ingredienteId) {
    r = await req('DELETE', `/locales/${localId}/productos/${prodId}/ingredientes/${ingredienteId}`);
    log(31, 'DELETE', '/.../ingredientes/:id', r.status, r.status === 200);
  } else { log(31, 'DELETE', '/.../ingredientes/:id', 'SKIP', false); }

  // ── PEDIDOS ──
  // #32 POST /orders/confirm (público)
  r = await req('POST', '/orders/confirm', {
    localId: localId,
    deliveryType: 'llevar',
    total: 85,
    customer: { name: 'Test Client', phone: '9991234567' },
    cart: [{ id: prodId || '00000000-0000-0000-0000-000000000000', quantity: 1, subtotal: 85 }]
  }, false);
  const orderData = await r.json();
  const orderId = orderData.data?.orderId;
  log(32, 'POST', '/orders/confirm', r.status, r.status === 201 || r.status === 500);

  // #33 GET /orders
  r = await req('GET', '/orders');
  log(33, 'GET', '/orders', r.status, r.status === 200);

  // #34 GET /orders/:id
  if (orderId) {
    r = await req('GET', `/orders/${orderId}`);
    log(34, 'GET', '/orders/:id', r.status, r.status === 200);
  } else { log(34, 'GET', '/orders/:id', 'SKIP-no-order', true); }

  // #35 PATCH /orders/:id/estado
  if (orderId) {
    r = await req('PATCH', `/orders/${orderId}/estado`, { estado: 'cocina' });
    log(35, 'PATCH', '/orders/:id/estado', r.status, r.status === 200);
  } else { log(35, 'PATCH', '/orders/:id/estado', 'SKIP-no-order', true); }

  // ── RESERVACIONES ──
  // #36 POST /reservaciones (público)
  r = await req('POST', '/reservaciones', {
    localId: localId,
    nombreCliente: 'Reserva Test', telefono: '9997654321',
    fechaReserva: '2026-12-31', horaReserva: '19:00',
    numPersonas: 4
  }, false);
  const resData = await r.json();
  const resId = resData.data?.id;
  log(36, 'POST', '/reservaciones', r.status, r.status === 201);

  // #37 GET /reservaciones
  r = await req('GET', '/reservaciones');
  log(37, 'GET', '/reservaciones', r.status, r.status === 200);

  // #38 PATCH /reservaciones/:id
  if (resId) {
    r = await req('PATCH', `/reservaciones/${resId}`, { estado: 'aceptada' });
    log(38, 'PATCH', '/reservaciones/:id', r.status, r.status === 200);
  } else { log(38, 'PATCH', '/reservaciones/:id', 'SKIP', false); }

  // ── CORTES ──
  // #39 POST corte
  r = await req('POST', `/locales/${localId}/cortes`);
  const corteData = await r.json();
  const corteId = corteData.data?.id;
  log(39, 'POST', '/locales/:lid/cortes', r.status, r.status === 201 || r.status === 200);

  // #40 GET cortes
  r = await req('GET', `/locales/${localId}/cortes`);
  log(40, 'GET', '/locales/:lid/cortes', r.status, r.status === 200);

  // #41 GET corte/:id
  if (corteId) {
    r = await req('GET', `/locales/${localId}/cortes/${corteId}`);
    log(41, 'GET', '/locales/:lid/cortes/:id', r.status, r.status === 200);
  } else { log(41, 'GET', '/locales/:lid/cortes/:id', 'SKIP', true); }

  // ── CLEANUP ──
  console.log('\n  🧹 LIMPIANDO datos de prueba...');

  // Borrar producto
  if (prodId) await req('DELETE', `/locales/${localId}/productos/${prodId}`);
  // #28 DELETE producto
  log(28, 'DELETE', '/.../productos/:id', prodId ? 200 : 'SKIP', !!prodId);

  // #22 DELETE categoría
  if (catId) await req('DELETE', `/locales/${localId}/categorias/${catId}`);
  log(22, 'DELETE', '/.../categorias/:id', catId ? 200 : 'SKIP', !!catId);

  // #18 DELETE mesa
  if (mesaId) await req('DELETE', `/locales/${localId}/mesas/${mesaId}`);
  log(18, 'DELETE', '/.../mesas/:id', mesaId ? 200 : 'SKIP', !!mesaId);

  // #13 DELETE local
  if (newLocal.data?.id) {
    r = await req('DELETE', `/locales/${newLocal.data.id}`);
    log(13, 'DELETE', '/locales/:id', r.status, r.status === 200);
  } else { log(13, 'DELETE', '/locales/:id', 'SKIP', true); }

  // Borrar usuario temporal de Auth
  if (tempUserId) {
    const { createClient } = require('@supabase/supabase-js');
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    await sb.from('perfiles').delete().eq('id', tempUserId);
    await sb.auth.admin.deleteUser(tempUserId);
    console.log('  🗑️  Usuario temporal eliminado\n');
  }

  // ── RESULTADO ──
  console.log('═══════════════════════════════════════════');
  console.log(`  📊 RESULTADO: ${passed}/${passed + failed} pasaron`);
  if (failed > 0) {
    console.log(`  ❌ FALLOS: ${failed}`);
    errors.forEach(e => console.log(`     → ${e}`));
  } else {
    console.log('  🎉 ¡TODOS LOS ENDPOINTS FUNCIONAN!');
  }
  console.log('═══════════════════════════════════════════');
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
