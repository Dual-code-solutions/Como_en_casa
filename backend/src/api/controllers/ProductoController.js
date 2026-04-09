// src/api/controllers/ProductoController.js

class ProductoController {
  constructor({ listProductosUseCase, getProductoUseCase, createProductoUseCase,
                updateProductoUseCase, toggleDisponibilidadUseCase, deleteProductoUseCase,
                addIngredienteUseCase, updateIngredienteUseCase, deleteIngredienteUseCase }) {
    this._listProductos       = listProductosUseCase;
    this._getProducto         = getProductoUseCase;
    this._createProducto      = createProductoUseCase;
    this._updateProducto      = updateProductoUseCase;
    this._toggleDisponibilidad = toggleDisponibilidadUseCase;
    this._deleteProducto      = deleteProductoUseCase;
    this._addIngrediente      = addIngredienteUseCase;
    this._updateIngrediente   = updateIngredienteUseCase;
    this._deleteIngrediente   = deleteIngredienteUseCase;

    this.list                 = this.list.bind(this);
    this.get                  = this.get.bind(this);
    this.create               = this.create.bind(this);
    this.update               = this.update.bind(this);
    this.toggleDisponibilidad = this.toggleDisponibilidad.bind(this);
    this.delete               = this.delete.bind(this);
    this.addIngrediente       = this.addIngrediente.bind(this);
    this.updateIngrediente    = this.updateIngrediente.bind(this);
    this.deleteIngrediente    = this.deleteIngrediente.bind(this);
  }

  // #23 GET /api/locales/:localId/productos
  async list(req, res, next) {
    try {
      const productos = await this._listProductos.execute({
        localId:     req.params.localId,
        categoriaId: req.query.categoria,
        disponible:  req.query.disponible !== undefined ? req.query.disponible === 'true' : undefined,
        visible:     req.query.visible !== undefined ? req.query.visible === 'true' : undefined
      });
      res.json({ success: true, data: productos });
    } catch (e) { next(e); }
  }

  // #24 GET /api/locales/:localId/productos/:id
  async get(req, res, next) {
    try {
      const producto = await this._getProducto.execute({
        productoId: req.params.id
      });
      res.json({ success: true, data: producto });
    } catch (e) { next(e); }
  }

  // #25 POST /api/locales/:localId/productos
  async create(req, res, next) {
    try {
      const producto = await this._createProducto.execute({
        localId:      req.params.localId,
        categoriaId:  req.body.categoriaId,
        nombre:       req.body.nombre,
        descripcion:  req.body.descripcion,
        precioBase:   req.body.precioBase,
        imagenUrl:    req.body.imagenUrl,
        disponible:   req.body.disponible,
        visibleMenu:  req.body.visibleMenu,
        ingredientes: req.body.ingredientes
      });
      res.status(201).json({ success: true, data: producto });
    } catch (e) { next(e); }
  }

  // #26 PATCH /api/locales/:localId/productos/:id
  async update(req, res, next) {
    try {
      const producto = await this._updateProducto.execute({
        productoId: req.params.id,
        data:       req.body
      });
      res.json({ success: true, data: producto });
    } catch (e) { next(e); }
  }

  // #27 PATCH /api/locales/:localId/productos/:id/disponibilidad
  async toggleDisponibilidad(req, res, next) {
    try {
      const producto = await this._toggleDisponibilidad.execute({
        productoId:  req.params.id,
        disponible:  req.body.disponible
      });
      res.json({ success: true, data: producto });
    } catch (e) { next(e); }
  }

  // #28 DELETE /api/locales/:localId/productos/:id
  async delete(req, res, next) {
    try {
      await this._deleteProducto.execute({ productoId: req.params.id });
      res.json({ success: true, message: 'Producto eliminado' });
    } catch (e) { next(e); }
  }

  // #29 POST /api/locales/:localId/productos/:productoId/ingredientes
  async addIngrediente(req, res, next) {
    try {
      const ingrediente = await this._addIngrediente.execute({
        productoId:        req.params.productoId,
        nombreIngrediente: req.body.nombreIngrediente,
        precioExtra:       req.body.precioExtra,
        permiteDoble:      req.body.permiteDoble,
        esBase:            req.body.esBase
      });
      res.status(201).json({ success: true, data: ingrediente });
    } catch (e) { next(e); }
  }

  // #30 PATCH /api/locales/:localId/productos/:productoId/ingredientes/:id
  async updateIngrediente(req, res, next) {
    try {
      const ingrediente = await this._updateIngrediente.execute({
        ingredienteId: req.params.id,
        data:          req.body
      });
      res.json({ success: true, data: ingrediente });
    } catch (e) { next(e); }
  }

  // #31 DELETE /api/locales/:localId/productos/:productoId/ingredientes/:id
  async deleteIngrediente(req, res, next) {
    try {
      await this._deleteIngrediente.execute({ ingredienteId: req.params.id });
      res.json({ success: true, message: 'Ingrediente eliminado' });
    } catch (e) { next(e); }
  }
}

module.exports = ProductoController;
