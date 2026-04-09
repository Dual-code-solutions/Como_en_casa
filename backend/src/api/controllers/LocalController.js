// src/api/controllers/LocalController.js

class LocalController {
  constructor({ listLocalesUseCase, getLocalUseCase, createLocalUseCase,
                updateLocalUseCase, deleteLocalUseCase }) {
    this._listLocales = listLocalesUseCase;
    this._getLocal    = getLocalUseCase;
    this._createLocal = createLocalUseCase;
    this._updateLocal = updateLocalUseCase;
    this._deleteLocal = deleteLocalUseCase;

    this.list   = this.list.bind(this);
    this.get    = this.get.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  // #09 GET /api/locales
  async list(req, res, next) {
    try {
      const locales = await this._listLocales.execute();
      res.json({ success: true, data: locales });
    } catch (e) { next(e); }
  }

  // #10 GET /api/locales/:id
  async get(req, res, next) {
    try {
      const local = await this._getLocal.execute({
        localId:     req.params.id,
        userRole:    req.userRole,
        userLocalId: req.userLocalId
      });
      res.json({ success: true, data: local });
    } catch (e) { next(e); }
  }

  // #11 POST /api/locales
  async create(req, res, next) {
    try {
      const local = await this._createLocal.execute(req.body);
      res.status(201).json({ success: true, data: local });
    } catch (e) { next(e); }
  }

  // #12 PATCH /api/locales/:id
  async update(req, res, next) {
    try {
      const local = await this._updateLocal.execute({
        localId: req.params.id,
        data:    req.body
      });
      res.json({ success: true, data: local });
    } catch (e) { next(e); }
  }

  // #13 DELETE /api/locales/:id
  async delete(req, res, next) {
    try {
      await this._deleteLocal.execute({ localId: req.params.id });
      res.json({ success: true, message: 'Local eliminado' });
    } catch (e) { next(e); }
  }
}

module.exports = LocalController;
