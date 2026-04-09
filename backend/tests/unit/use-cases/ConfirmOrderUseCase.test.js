// tests/unit/use-cases/ConfirmOrderUseCase.test.js
const ConfirmOrderUseCase = require('../../../src/application/use-cases/orders/ConfirmOrderUseCase');

describe('ConfirmOrderUseCase', () => {
  // ── Mocks ──
  const mockOrderRepo = {
    save: jest.fn()
  };
  const mockMesaRepo = {
    findById: jest.fn(),
    updateEstado: jest.fn()
  };
  const mockIO = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn()
  };

  const useCase = new ConfirmOrderUseCase({
    orderRepository: mockOrderRepo,
    mesaRepository:  mockMesaRepo,
    socketIO:        mockIO
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Éxito: Pedido local con mesa ──

  test('crea pedido local, marca mesa como ocupada, emite WebSocket', async () => {
    mockMesaRepo.findById.mockResolvedValue({ id: 'mesa-1', localId: 'local-1' });
    mockOrderRepo.save.mockResolvedValue({ id: 'orden-1', localId: 'local-1' });

    await useCase.execute({
      localId:      'local-1',
      deliveryType: 'local',
      customer:     { name: 'Juan', phone: '9991234567', table: 'mesa-1' },
      cart:         [{ id: 'prod-1', quantity: 2, subtotal: 170 }],
      total:        170
    });

    // Verificar que se guardó el pedido
    expect(mockOrderRepo.save).toHaveBeenCalledTimes(1);

    // Verificar que la mesa se marcó como ocupada
    expect(mockMesaRepo.updateEstado).toHaveBeenCalledWith('mesa-1', 'ocupada');

    // Verificar que se emitieron eventos WebSocket
    expect(mockIO.to).toHaveBeenCalledWith('local-1');
    expect(mockIO.emit).toHaveBeenCalledWith('new_order', expect.objectContaining({
      orderId:      'orden-1',
      customer:     'Juan',
      deliveryType: 'local',
      total:        170
    }));
  });

  // ── Éxito: Pedido a domicilio sin mesa ──

  test('crea pedido a domicilio sin tocar mesas', async () => {
    mockOrderRepo.save.mockResolvedValue({ id: 'orden-2', localId: 'local-1' });

    await useCase.execute({
      localId:      'local-1',
      deliveryType: 'domicilio',
      customer:     { name: 'Ana', phone: '9997654321', address: 'Calle 60 #200' },
      cart:         [{ id: 'prod-2', quantity: 1, subtotal: 85 }],
      total:        85
    });

    expect(mockOrderRepo.save).toHaveBeenCalledTimes(1);
    // NO debe intentar actualizar mesa
    expect(mockMesaRepo.updateEstado).not.toHaveBeenCalled();
  });

  // ── Error: Mesa no existe ──

  test('falla si la mesa no existe', async () => {
    mockMesaRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({
      localId:      'local-1',
      deliveryType: 'local',
      customer:     { name: 'Carlos', phone: '9991111111', table: 'mesa-inexistente' },
      cart:         [{ id: 'prod-1', quantity: 1, subtotal: 100 }],
      total:        100
    })).rejects.toThrow('Mesa no encontrada');
  });

  // ── Error: Modalidad inválida ──

  test('falla con modalidad inválida', async () => {
    await expect(useCase.execute({
      localId:      'local-1',
      deliveryType: 'recogida',
      customer:     { name: 'Pedro', phone: '9992222222' },
      cart:         [{ id: 'prod-1', quantity: 1, subtotal: 50 }],
      total:        50
    })).rejects.toThrow();
  });
});
