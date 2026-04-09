// src/api/controllers/CorteController.js

class CorteController {
  constructor({ generarCorteUseCase, listCortesUseCase, getCorteUseCase }) {
    this._generarCorte = generarCorteUseCase;
    this._listCortes   = listCortesUseCase;
    this._getCorte     = getCorteUseCase;

    this.generate = this.generate.bind(this);
    this.list     = this.list.bind(this);
    this.get      = this.get.bind(this);
  }

  // #39 POST /api/locales/:localId/cortes
  async generate(req, res, next) {
    try {
      const corte = await this._generarCorte.execute({
        localId: req.params.localId,
        adminId: req.userId
      });
      res.status(201).json({ success: true, data: corte });
    } catch (e) { next(e); }
  }

  // #40 GET /api/locales/:localId/cortes
  async list(req, res, next) {
    try {
      const cortes = await this._listCortes.execute({
        localId: req.params.localId,
        desde:   req.query.desde,
        hasta:   req.query.hasta
      });
      res.json({ success: true, data: cortes });
    } catch (e) { next(e); }
  }

  // #41 GET /api/locales/:localId/cortes/:id
  async get(req, res, next) {
    try {
      const corte = await this._getCorte.execute({
        corteId: req.params.id
      });
      res.json({ success: true, data: corte });
    } catch (e) { next(e); }
  }
}

module.exports = CorteController;
