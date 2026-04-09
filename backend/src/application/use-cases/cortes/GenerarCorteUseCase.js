// src/application/use-cases/cortes/GenerarCorteUseCase.js

class GenerarCorteUseCase {
  constructor({ corteRepository, orderRepository }) {
    this.corteRepo = corteRepository;
    this.orderRepo = orderRepository;
  }

  async execute({ localId, adminId }) {
    const hoy = new Date().toISOString().split('T')[0];

    // Verificar que no exista un corte del día para este local
    const yaExiste = await this.corteRepo.existeCorteEnFecha(localId, hoy);
    if (yaExiste) throw new Error('Ya se generó un corte de caja para hoy');

    // Obtener pedidos finalizados del día
    const { data: pedidos } = await this.orderRepo.findAll({
      localId,
      estado: 'finalizado',
      fecha:  hoy,
      page:   1,
      limit:  9999
    });

    // Calcular totales
    const totalIngresos    = pedidos.reduce((sum, p) => sum + p.total, 0);
    const conteoLocal      = pedidos.filter(p => p.modalidad === 'local').length;
    const conteoDomicilio  = pedidos.filter(p => p.modalidad === 'domicilio').length;
    const conteoLlevar     = pedidos.filter(p => p.modalidad === 'llevar').length;

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
