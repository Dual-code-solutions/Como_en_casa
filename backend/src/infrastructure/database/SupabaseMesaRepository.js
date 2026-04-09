// src/infrastructure/database/SupabaseMesaRepository.js
const MesaRepository = require('../../domain/repositories/MesaRepository');
const Mesa = require('../../domain/entities/Mesa');
const supabase = require('../config/supabase');

class SupabaseMesaRepository extends MesaRepository {

  async findAll(localId) {
    const { data, error } = await supabase
      .from('mesas')
      .select('*')
      .eq('id_local', localId)
      .order('nombre_o_numero', { ascending: true });

    if (error) throw new Error(error.message);
    return data.map(row => this._toEntity(row));
  }

  async findById(id) {
    const { data, error } = await supabase
      .from('mesas')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data ? this._toEntity(data) : null;
  }

  async save(mesa) {
    const { data, error } = await supabase
      .from('mesas')
      .insert({
        id_local:        mesa.localId,
        nombre_o_numero: mesa.nombreONumero,
        capacidad:       mesa.capacidad,
        estado_actual:   mesa.estadoActual || 'disponible'
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this._toEntity(data);
  }

  async update(id, data) {
    const updateData = {};
    if (data.nombreONumero !== undefined) updateData.nombre_o_numero = data.nombreONumero;
    if (data.capacidad !== undefined)     updateData.capacidad = data.capacidad;

    const { data: updated, error } = await supabase
      .from('mesas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this._toEntity(updated);
  }

  async updateEstado(id, estado) {
    const { data, error } = await supabase
      .from('mesas')
      .update({ estado_actual: estado })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this._toEntity(data);
  }

  async delete(id) {
    const { error } = await supabase
      .from('mesas')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  async hasActiveOrders(id) {
    const { count, error } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })
      .eq('id_mesa', id)
      .in('estado', ['entrante', 'cocina', 'listo']);

    if (error) throw new Error(error.message);
    return count > 0;
  }

  _toEntity(row) {
    return new Mesa({
      id:             row.id,
      localId:        row.id_local,
      nombreONumero:  row.nombre_o_numero,
      capacidad:      row.capacidad,
      estadoActual:   row.estado_actual,
      creadoAt:       row.creado_at
    });
  }
}

module.exports = SupabaseMesaRepository;
