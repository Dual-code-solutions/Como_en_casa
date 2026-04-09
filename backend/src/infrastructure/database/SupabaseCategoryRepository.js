// src/infrastructure/database/SupabaseCategoryRepository.js
const CategoryRepository = require('../../domain/repositories/CategoryRepository');
const supabase = require('../config/supabase');

class SupabaseCategoryRepository extends CategoryRepository {

  async findAll(localId) {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('id_local', localId)
      .order('orden', { ascending: true });

    if (error) throw new Error(error.message);
    return data.map(row => this._toResponse(row));
  }

  async findById(id) {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data ? this._toResponse(data) : null;
  }

  async save(catData) {
    const { data, error } = await supabase
      .from('categorias')
      .insert({
        id_local: catData.localId,
        nombre:   catData.nombre,
        orden:    catData.orden || 0
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this._toResponse(data);
  }

  async update(id, catData) {
    const updateData = {};
    if (catData.nombre !== undefined) updateData.nombre = catData.nombre;
    if (catData.orden !== undefined)  updateData.orden = catData.orden;

    const { data, error } = await supabase
      .from('categorias')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this._toResponse(data);
  }

  async delete(id) {
    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  async countProductos(id) {
    const { count, error } = await supabase
      .from('productos')
      .select('*', { count: 'exact', head: true })
      .eq('id_categoria', id);

    if (error) throw new Error(error.message);
    return count || 0;
  }

  _toResponse(row) {
    return {
      id:       row.id,
      localId:  row.id_local,
      nombre:   row.nombre,
      orden:    row.orden
    };
  }
}

module.exports = SupabaseCategoryRepository;
