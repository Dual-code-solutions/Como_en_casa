// tests/e2e/orders.e2e.test.js
const request = require('supertest');

// Mock de las variables de entorno ANTES de importar la app
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.JWT_EXPIRES_IN = '1h';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
process.env.NODE_ENV = 'test';

const createApp = require('../../src/app');

describe('Orders API — E2E', () => {
  const mockIO = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn()
  };
  const app = createApp(mockIO);

  // ──────────────────────────────────────
  // POST /api/orders/confirm
  // ──────────────────────────────────────

  describe('POST /api/orders/confirm', () => {
    test('rechaza body vacío con 400', async () => {
      const res = await request(app)
        .post('/api/orders/confirm')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    test('rechaza localId con formato inválido', async () => {
      const res = await request(app)
        .post('/api/orders/confirm')
        .send({ localId: 'no-es-uuid' });

      expect(res.status).toBe(400);
      expect(res.body.errors.some(e => e.field === 'localId')).toBe(true);
    });

    test('rechaza carrito vacío', async () => {
      const res = await request(app)
        .post('/api/orders/confirm')
        .send({
          localId:      '11111111-1111-1111-1111-111111111111',
          deliveryType: 'local',
          total:        100,
          customer:     { name: 'Test', phone: '9991234567' },
          cart:         []
        });

      expect(res.status).toBe(400);
      expect(res.body.errors.some(e => e.field === 'cart')).toBe(true);
    });

    test('rechaza modalidad inválida', async () => {
      const res = await request(app)
        .post('/api/orders/confirm')
        .send({
          localId:      '11111111-1111-1111-1111-111111111111',
          deliveryType: 'recogida',
          total:        100,
          customer:     { name: 'Test', phone: '9991234567' },
          cart:         [{ id: '22222222-2222-2222-2222-222222222222', quantity: 1, subtotal: 100 }]
        });

      expect(res.status).toBe(400);
    });
  });

  // ──────────────────────────────────────
  // GET /api/orders (requiere auth)
  // ──────────────────────────────────────

  describe('GET /api/orders', () => {
    test('rechaza petición sin token con 401', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('rechaza token inválido con 401', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', 'Bearer token-falso-123');

      expect(res.status).toBe(401);
    });
  });

  // ──────────────────────────────────────
  // PATCH /api/orders/:id/estado (requiere auth)
  // ──────────────────────────────────────

  describe('PATCH /api/orders/:id/estado', () => {
    test('rechaza sin token con 401', async () => {
      const res = await request(app)
        .patch('/api/orders/some-id/estado')
        .send({ estado: 'cocina' });

      expect(res.status).toBe(401);
    });
  });

  // ──────────────────────────────────────
  // Ruta 404
  // ──────────────────────────────────────

  describe('Rutas inexistentes', () => {
    test('responde 404 para rutas no definidas', async () => {
      const res = await request(app).get('/api/ruta-que-no-existe');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ──────────────────────────────────────
  // Health Check
  // ──────────────────────────────────────

  describe('GET /api/health', () => {
    test('responde con status ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('ok');
    });
  });
});
