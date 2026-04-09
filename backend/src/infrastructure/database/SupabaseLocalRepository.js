// src/infrastructure/database/SupabaseLocalRepository.js
const LocalRepository = require('../../domain/repositories/LocalRepository');
const supabase = require('../config/supabase');

class SupabaseLocalRepository extends LocalRepository {

  async findAll() {
    const { data, error } = await supabase
      .from('locales')
      .select('*')
      .order('creado_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(row => this._toResponse(row));
  }

  async findById(id) {
    const { data, error } = await supabase
      .from('locales')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data ? this._toResponse(data) : null;
  }

  async findBySlug(slug) {
    const { data, error } = await supabase
      .from('locales')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data ? this._toResponse(data) : null;
  }

  async create(localData) {
    const { data, error } = await supabase
      .from('locales')
      .insert({
        nombre_sucursal: localData.nombreSucursal,
        slug:            localData.slug,
        configuracion:   localData.configuracion || {}
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this._toResponse(data);
  }

  async update(id, localData) {
    const updateData = {};
    if (localData.nombreSucursal !== undefined) updateData.nombre_sucursal = localData.nombreSucursal;
    if (localData.slug !== undefined)           updateData.slug = localData.slug;
    if (localData.configuracion !== undefined)  updateData.configuracion = localData.configuracion;

    const { data, error } = await supabase
      .from('locales')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this._toResponse(data);
  }

  async delete(id) {
    const { error } = await supabase
      .from('locales')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  _toResponse(row) {
    return {
      id:              row.id,
      nombreSucursal:  row.nombre_sucursal,
      slug:            row.slug,
      configuracion:   row.configuracion,
      creadoAt:        row.creado_at
    };
  }
}

module.exports = SupabaseLocalRepository;
