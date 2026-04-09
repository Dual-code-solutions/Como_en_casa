// src/infrastructure/database/SupabaseOrderRepository.js
const OrderRepository = require('../../domain/repositories/OrderRepository');
const Order = require('../../domain/entities/Order');
const supabase = require('../config/supabase');

class SupabaseOrderRepository extends OrderRepository {

  async findById(id) {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*, detalle_pedido(*, productos(nombre, precio_base)), mesas(nombre_o_numero)')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data ? this._toEntity(data) : null;
  }

  async findAll({ localId, estado, fecha, mesaId, page = 1, limit = 30 }) {
    const offset = (page - 1) * limit;

    let query = supabase
      .from('pedidos')
      .select('*, detalle_pedido(*, productos(nombre, precio_base)), mesas(nombre_o_numero)', { count: 'exact' })
      .order('creado_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (localId) query = query.eq('id_local', localId);

    if (estado) query = query.eq('estado', estado);
    if (mesaId) query = query.eq('id_mesa', mesaId);
    if (fecha) {
      query = query
        .gte('creado_at', `${fecha}T00:00:00-06:00`)
        .lte('creado_at', `${fecha}T23:59:59-06:00`);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return {
      data: data.map(row => this._toEntity(row)),
      meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) }
    };
  }

  async save(order) {
    // 1. Insertar cabecera del pedido
    const { data: savedOrder, error: orderError } = await supabase
      .from('pedidos')
      .insert({
        id_local:              order.localId,
        id_mesa:               order.mesaId,
        nombre_cliente:        order.nombreCliente,
        telefono:              order.telefono,
        modalidad:             order.modalidad,
        direccion_envio:       order.direccionEnvio || null,
        referencia_ubicacion:  order.referenciaUbicacion || null,
        total_pago:            order.total,
        estado:                order.estado
      })
      .select()
      .single();

    if (orderError) throw new Error(orderError.message);

    // 2. Insertar detalle de los items
    if (order.items && order.items.length > 0) {
      const detalle = order.items.map(item => ({
        id_pedido:       savedOrder.id,
        id_producto:     item.id,
        cantidad:        item.quantity || 1,
        personalizacion: item.mods || [],
        subtotal:        item.subtotal
      }));

      const { error: detalleError } = await supabase
        .from('detalle_pedido')
        .insert(detalle);

      if (detalleError) throw new Error(detalleError.message);
    }

    return this._toEntity(savedOrder);
  }

  async updateEstado({ id, estado, tiempoEsperaMinutos, motivoCancelacion }) {
    const updatePayload = { estado };
    if (tiempoEsperaMinutos !== undefined && tiempoEsperaMinutos !== null) {
      updatePayload.tiempo_espera_minutos = tiempoEsperaMinutos;
    }
    if (motivoCancelacion) {
      updatePayload.motivo_cancelacion = motivoCancelacion;
    }

    const { data, error } = await supabase
      .from('pedidos')
      .update(updatePayload)
      .eq('id', id)
      .select('*, detalle_pedido(*, productos(nombre, precio_base)), mesas(nombre_o_numero)')
      .single();

    if (error) throw new Error(error.message);
    return this._toEntity(data);
  }

  async countActivosPorMesa(mesaId) {
    const { count, error } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })
      .eq('id_mesa', mesaId)
      .in('estado', ['entrante', 'cocina', 'listo']);

    if (error) throw new Error(error.message);
    return count || 0;
  }

  _toEntity(row) {
    return new Order({
      id:                   row.id,
      localId:              row.id_local,
      mesaId:               row.id_mesa,
      nombreCliente:        row.nombre_cliente,
      telefono:             row.telefono,
      modalidad:            row.modalidad,
      direccionEnvio:       row.direccion_envio,
      referenciaUbicacion:  row.referencia_ubicacion,
      items:                row.detalle_pedido || [],
      total:                parseFloat(row.total_pago),
      estado:               row.estado,
      numOrdenDia:          row.num_orden_dia,
      tiempoEsperaMinutos:  row.tiempo_espera_minutos,
      motivoCancelacion:    row.motivo_cancelacion,
      creadoAt:             row.creado_at
    });
  }
}

module.exports = SupabaseOrderRepository;
