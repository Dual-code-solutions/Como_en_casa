// src/application/use-cases/cortes/GenerarCorteUseCase.js

class GenerarCorteUseCase {
  constructor({ corteRepository, orderRepository }) {
    this.corteRepo = corteRepository;
    this.orderRepo = orderRepository;
  }

  async execute({ localId, adminId }) {
    const hoy = new Date().toISOString().split('T')[0];

    // Eliminar la prohibición de múltiples cortes al día. 
    // Obtener los cortes de hoy para encontrar la hora del último corte cerrado.
    const cortesHoy = await this.corteRepo.findAll({ localId, desde: hoy, hasta: hoy });
    const ultimoCorte = cortesHoy[0]; // están ordenados desc
    const thresholdTime = ultimoCorte ? new Date(ultimoCorte.cerradoAt).getTime() : 0;

    // Obtener pedidos del día
    const { data: todosPedidos } = await this.orderRepo.findAll({
      localId,
      estado: 'finalizado',
      fecha:  hoy,
      page:   1,
      limit:  9999
    });

    // Quedarse únicamente con los pedidos cobrados DESPUÉS del último corte de caja.
    const pedidos = todosPedidos.filter(p => new Date(p.creadoAt).getTime() > thresholdTime);

    if (pedidos.length === 0) {
      throw new Error('No hay pedidos nuevos cobrados para encapsular en una caja nueva.');
    }

    // Calcular totales
    const totalIngresos    = pedidos.reduce((sum, p) => sum + p.total, 0);
    const conteoLocal      = pedidos.filter(p => p.modalidad === 'local').length;
    const conteoLlevar     = pedidos.filter(p => p.modalidad === 'pasar_a_recoger').length;
    const conteoDomicilio  = pedidos.filter(p => p.modalidad === 'domicilio').length;

    // Guardar corte
    return this.corteRepo.save({
      localId,
      adminId,
      fechaCorte:             hoy,
      totalIngresosDia:       totalIngresos,
      conteoPedidosLocal:     conteoLocal,
      conteoPedidosDomicilio: conteoDomicilio,
      conteoPedidosLlevar:    conteoLlevar,
      resumenMetodosPago:     {}
    });
  }
}

module.exports = GenerarCorteUseCase;
