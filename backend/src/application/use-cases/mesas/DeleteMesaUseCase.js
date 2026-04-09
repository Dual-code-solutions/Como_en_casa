// src/application/use-cases/mesas/DeleteMesaUseCase.js

class DeleteMesaUseCase {
  constructor({ mesaRepository }) {
    this.mesaRepo = mesaRepository;
  }

  async execute({ mesaId }) {
    const mesa = await this.mesaRepo.findById(mesaId);
    if (!mesa) throw new Error('Mesa no encontrada');

    // Verificar que no tenga pedidos activos
    const tieneActivos = await this.mesaRepo.hasActiveOrders(mesaId);
    if (tieneActivos) {
      throw new Error('No se puede eliminar una mesa con pedidos activos');
    }

    return this.mesaRepo.delete(mesaId);
  }
}

module.exports = DeleteMesaUseCase;
