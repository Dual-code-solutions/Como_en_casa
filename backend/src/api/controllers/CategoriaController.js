// src/api/controllers/CategoriaController.js

class CategoriaController {
  constructor({ listCategoriasUseCase, createCategoriaUseCase,
                updateCategoriaUseCase, deleteCategoriaUseCase }) {
    this._listCategorias  = listCategoriasUseCase;
    this._createCategoria = createCategoriaUseCase;
    this._updateCategoria = updateCategoriaUseCase;
    this._deleteCategoria = deleteCategoriaUseCase;

    this.list   = this.list.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  // #19 GET /api/locales/:localId/categorias
  async list(req, res, next) {
    try {
      const categorias = await this._listCategorias.execute({
        localId: req.params.localId
      });
      res.json({ success: true, data: categorias });
    } catch (e) { next(e); }
  }

  // #20 POST /api/locales/:localId/categorias
  async create(req, res, next) {
    try {
      const categoria = await this._createCategoria.execute({
        localId: req.params.localId,
        nombre:  req.body.nombre,
        orden:   req.body.orden
      });
      res.status(201).json({ success: true, data: categoria });
    } catch (e) { next(e); }
  }

  // #21 PATCH /api/locales/:localId/categorias/:id
  async update(req, res, next) {
    try {
      const categoria = await this._updateCategoria.execute({
        categoriaId: req.params.id,
        data:        req.body
      });
      res.json({ success: true, data: categoria });
    } catch (e) { next(e); }
  }

  // #22 DELETE /api/locales/:localId/categorias/:id
  async delete(req, res, next) {
    try {
      await this._deleteCategoria.execute({ categoriaId: req.params.id });
      res.json({ success: true, message: 'Categoría eliminada' });
    } catch (e) { next(e); }
  }
}

module.exports = CategoriaController;
