// tests/unit/domain/Order.test.js
const Order = require('../../../src/domain/entities/Order');

describe('Order Entity', () => {
  const baseOrder = {
    localId:        'local-1',
    mesaId:         'mesa-1',
    nombreCliente:  'Juan Pérez',
    telefono:       '9991234567',
    modalidad:      'local',
    items:          [{ subtotal: 170 }, { subtotal: 120 }],
    total:          290
  };

  // ── Estado Machine ──

  test('debe iniciar con estado "entrante"', () => {
    const order = new Order(baseOrder);
    expect(order.estado).toBe('entrante');
  });

  test('avanza de entrante → cocina', () => {
    const order = new Order(baseOrder);
    order.avanzarEstado();
    expect(order.estado).toBe('cocina');
  });

  test('avanza de cocina → listo', () => {
    const order = new Order({ ...baseOrder, estado: 'cocina' });
    order.avanzarEstado();
    expect(order.estado).toBe('listo');
  });

  test('avanza de listo → finalizado', () => {
    const order = new Order({ ...baseOrder, estado: 'listo' });
    order.avanzarEstado();
    expect(order.estado).toBe('finalizado');
  });

  test('NO puede avanzar desde finalizado', () => {
    const order = new Order({ ...baseOrder, estado: 'finalizado' });
    expect(() => order.avanzarEstado()).toThrow();
  });

  // ── Cancelación ──

  test('puede cancelar si está en "entrante"', () => {
    const order = new Order(baseOrder);
    order.cancelar();
    expect(order.estado).toBe('cancelado');
  });

  test('NO puede cancelar si ya está en "cocina"', () => {
    const order = new Order({ ...baseOrder, estado: 'cocina' });
    expect(() => order.cancelar()).toThrow('Solo se puede cancelar un pedido entrante');
  });

  // ── Cálculo ──

  test('calcula el total sumando subtotales', () => {
    const order = new Order(baseOrder);
    expect(order.calcularTotal()).toBe(290);
  });

  // ── Modalidad ──

  test('valida modalidad correcta', () => {
    expect(() => Order.validarModalidad('local')).not.toThrow();
    expect(() => Order.validarModalidad('domicilio')).not.toThrow();
    expect(() => Order.validarModalidad('pasar_a_recoger')).not.toThrow();
  });

  test('rechaza modalidad inválida', () => {
    expect(() => Order.validarModalidad('recogida')).toThrow();
  });

  // ── Campos de dirección ──

  test('permite dirección de envío para domicilio', () => {
    const order = new Order({
      ...baseOrder,
      modalidad: 'domicilio',
      direccionEnvio: 'Calle 50 #123',
      referenciaUbicacion: 'Casa blanca esquina'
    });
    expect(order.direccionEnvio).toBe('Calle 50 #123');
    expect(order.referenciaUbicacion).toBe('Casa blanca esquina');
  });

  test('dirección es null si no se proporciona', () => {
    const order = new Order(baseOrder);
    expect(order.direccionEnvio).toBeNull();
    expect(order.referenciaUbicacion).toBeNull();
  });
});
