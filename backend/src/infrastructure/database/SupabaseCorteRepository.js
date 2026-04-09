// src/infrastructure/database/SupabaseCorteRepository.js
const CorteRepository = require('../../domain/repositories/CorteRepository');
const supabase = require('../config/supabase');

class SupabaseCorteRepository extends CorteRepository {

  async save(corte) {
    const { data, error } = await supabase
      .from('historial_cortes')
      .insert({
        id_local:                corte.localId,
        id_admin_cierre:         corte.adminId,
        fecha_corte:             corte.fechaCorte,
        total_ingresos_dia:      corte.totalIngresosDia,
        conteo_pedidos_local:    corte.conteoPedidosLocal,
        conteo_pedidos_domicilio: corte.conteoPedidosDomicilio,
        conteo_pedidos_llevar:   corte.conteoPedidosLlevar,
        resumen_metodos_pago:    corte.resumenMetodosPago || {}
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this._toResponse(data);
  }

  async findAll(filters) {
    let query = supabase
      .from('historial_cortes')
      .select('*')
      .eq('id_local', filters.localId)
      .order('fecha_corte', { ascending: false });

    if (filters.desde) query = query.gte('fecha_corte', filters.desde);
    if (filters.hasta) query = query.lte('fecha_corte', filters.hasta);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data.map(row => this._toResponse(row));
  }

  async findById(id) {
    const { data, error } = await supabase
      .from('historial_cortes')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data ? this._toResponse(data) : null;
  }

  async existeCorteEnFecha(localId, fecha) {
    const { data, error } = await supabase
      .from('historial_cortes')
      .select('id')
      .eq('id_local', localId)
      .eq('fecha_corte', fecha);

    if (error) throw new Error(error.message);
    return data.length > 0;
  }

  _toResponse(row) {
    return {
      id:                     row.id,
      localId:                row.id_local,
      adminId:                row.id_admin_cierre,
      fechaCorte:             row.fecha_corte,
      totalIngresosDia:       parseFloat(row.total_ingresos_dia),
      conteoPedidosLocal:     row.conteo_pedidos_local,
      conteoPedidosDomicilio: row.conteo_pedidos_domicilio,
      conteoPedidosLlevar:    row.conteo_pedidos_llevar,
      resumenMetodosPago:     row.resumen_metodos_pago,
      cerradoAt:              row.cerrado_at
    };
  }
}

module.exports = SupabaseCorteRepository;
