// src/api/controllers/MesaController.js

class MesaController {
  constructor({ listMesasUseCase, createMesaUseCase, updateMesaUseCase,
                changeMesaEstadoUseCase, deleteMesaUseCase }) {
    this._listMesas   = listMesasUseCase;
    this._createMesa  = createMesaUseCase;
    this._updateMesa  = updateMesaUseCase;
    this._changeEstado = changeMesaEstadoUseCase;
    this._deleteMesa  = deleteMesaUseCase;

    this.list         = this.list.bind(this);
    this.create       = this.create.bind(this);
    this.update       = this.update.bind(this);
    this.updateEstado = this.updateEstado.bind(this);
    this.delete       = this.delete.bind(this);
  }

  // #14 GET /api/locales/:localId/mesas
  async list(req, res, next) {
    try {
      const mesas = await this._listMesas.execute({
        localId: req.params.localId
      });
      res.json({ success: true, data: mesas });
    } catch (e) { next(e); }
  }

  // #15 POST /api/locales/:localId/mesas
  async create(req, res, next) {
    try {
      const mesa = await this._createMesa.execute({
        localId:       req.params.localId,
        nombreONumero: req.body.nombre_o_numero,
        descripcion:   req.body.descripcion,
        capacidad:     req.body.capacidad
      });
      res.status(201).json({ success: true, data: mesa });
    } catch (e) { next(e); }
  }

  // #16 PATCH /api/locales/:localId/mesas/:id
  async update(req, res, next) {
    try {
      const mesa = await this._updateMesa.execute({
        mesaId: req.params.id,
        data: {
          nombreONumero: req.body.nombre_o_numero,
          descripcion:   req.body.descripcion,
          capacidad:     req.body.capacidad
        }
      });
      res.json({ success: true, data: mesa });
    } catch (e) { next(e); }
  }

  // #17 PATCH /api/locales/:localId/mesas/:id/estado
  async updateEstado(req, res, next) {
    try {
      const mesa = await this._changeEstado.execute({
        mesaId:       req.params.id,
        estadoActual: req.body.estado_actual
      });
      res.json({ success: true, data: mesa });
    } catch (e) { next(e); }
  }

  // #18 DELETE /api/locales/:localId/mesas/:id
  async delete(req, res, next) {
    try {
      await this._deleteMesa.execute({ mesaId: req.params.id });
      res.json({ success: true, message: 'Mesa eliminada' });
    } catch (e) { next(e); }
  }
}

module.exports = MesaController;
