// src/infrastructure/database/SupabaseProductRepository.js
const ProductRepository = require('../../domain/repositories/ProductRepository');
const { Product, Ingrediente } = require('../../domain/entities/Product');
const supabase = require('../config/supabase');

class SupabaseProductRepository extends ProductRepository {

  async findAll(filters) {
    let query = supabase
      .from('productos')
      .select('*, ingredientes_personalizables(*)')
      .eq('id_local', filters.localId)
      .order('creado_at', { ascending: false });

    if (filters.categoriaId) query = query.eq('id_categoria', filters.categoriaId);
    if (filters.disponible !== undefined) query = query.eq('disponible', filters.disponible);
    if (filters.visible !== undefined) query = query.eq('visible_menu', filters.visible);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data.map(row => this._toEntity(row));
  }

  async findById(id) {
    const { data, error } = await supabase
      .from('productos')
      .select('*, ingredientes_personalizables(*)')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data ? this._toEntity(data) : null;
  }

  async save(product) {
    // 1. Insertar el producto
    const { data: savedProduct, error: productError } = await supabase
      .from('productos')
      .insert({
        id_local:      product.localId,
        id_categoria:  product.categoriaId,
        nombre:        product.nombre,
        descripcion:   product.descripcion,
        precio_base:   product.precioBase,
        imagen_url:    product.imagenUrl,
        disponible:    product.disponible,
        visible_menu:  product.visibleMenu
      })
      .select()
      .single();

    if (productError) throw new Error(productError.message);

    // 2. Insertar ingredientes en lote si existen
    if (product.ingredientes && product.ingredientes.length > 0) {
      const ingredientes = product.ingredientes.map(ing => ({
        id_producto:         savedProduct.id,
        nombre_ingrediente:  ing.nombreIngrediente,
        precio_extra:        ing.precioExtra || 0,
        permite_doble:       ing.permiteDoble !== undefined ? ing.permiteDoble : true,
        es_base:             ing.esBase !== undefined ? ing.esBase : true
      }));

      const { error: ingError } = await supabase
        .from('ingredientes_personalizables')
        .insert(ingredientes);

      if (ingError) throw new Error(ingError.message);
    }

    // 3. Retornar el producto completo con ingredientes
    return this.findById(savedProduct.id);
  }

  async update(id, data) {
    const updateData = {};
    if (data.nombre !== undefined)      updateData.nombre = data.nombre;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.precioBase !== undefined)  updateData.precio_base = data.precioBase;
    if (data.imagenUrl !== undefined)   updateData.imagen_url = data.imagenUrl;
    if (data.disponible !== undefined)  updateData.disponible = data.disponible;
    if (data.visibleMenu !== undefined) updateData.visible_menu = data.visibleMenu;
    if (data.categoriaId !== undefined) updateData.id_categoria = data.categoriaId;

    const { data: updated, error } = await supabase
      .from('productos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this._toEntity(updated);
  }

  async updateDisponibilidad(id, disponible) {
    const { data, error } = await supabase
      .from('productos')
      .update({ disponible })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this._toEntity(data);
  }

  async delete(id) {
    // Los ingredientes se eliminan en cascada por FK o manualmente
    await supabase.from('ingredientes_personalizables').delete().eq('id_producto', id);

    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  // ── INGREDIENTES ──

  async addIngrediente(ingrediente) {
    const { data, error } = await supabase
      .from('ingredientes_personalizables')
      .insert({
        id_producto:        ingrediente.productoId,
        nombre_ingrediente: ingrediente.nombreIngrediente,
        precio_extra:       ingrediente.precioExtra || 0,
        permite_doble:      ingrediente.permiteDoble !== undefined ? ingrediente.permiteDoble : true,
        es_base:            ingrediente.esBase !== undefined ? ingrediente.esBase : true
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this._toIngrediente(data);
  }

  async updateIngrediente(id, data) {
    const updateData = {};
    if (data.nombreIngrediente !== undefined) updateData.nombre_ingrediente = data.nombreIngrediente;
    if (data.precioExtra !== undefined)       updateData.precio_extra = data.precioExtra;
    if (data.permiteDoble !== undefined)      updateData.permite_doble = data.permiteDoble;
    if (data.esBase !== undefined)            updateData.es_base = data.esBase;

    const { data: updated, error } = await supabase
      .from('ingredientes_personalizables')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this._toIngrediente(updated);
  }

  async deleteIngrediente(id) {
    const { error } = await supabase
      .from('ingredientes_personalizables')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  _toEntity(row) {
    return new Product({
      id:           row.id,
      localId:      row.id_local,
      categoriaId:  row.id_categoria,
      nombre:       row.nombre,
      descripcion:  row.descripcion,
      precioBase:   parseFloat(row.precio_base),
      imagenUrl:    row.imagen_url,
      disponible:   row.disponible,
      visibleMenu:  row.visible_menu,
      ingredientes: (row.ingredientes_personalizables || []).map(i => this._toIngrediente(i)),
      creadoAt:     row.creado_at
    });
  }

  _toIngrediente(row) {
    return new Ingrediente({
      id:                row.id,
      productoId:        row.id_producto,
      nombreIngrediente: row.nombre_ingrediente,
      precioExtra:       parseFloat(row.precio_extra || 0),
      permiteDoble:      row.permite_doble,
      esBase:            row.es_base
    });
  }
}

module.exports = SupabaseProductRepository;
