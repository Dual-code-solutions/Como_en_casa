// src/infrastructure/database/SupabaseReservationRepository.js
const ReservationRepository = require('../../domain/repositories/ReservationRepository');
const Reservation = require('../../domain/entities/Reservation');
const supabase = require('../config/supabase');

class SupabaseReservationRepository extends ReservationRepository {

  async findAll(filters) {
    let query = supabase
      .from('reservaciones')
      .select('*, mesas(nombre_o_numero, capacidad)')
      .order('fecha_reserva', { ascending: true })
      .order('hora_reserva', { ascending: true });

    if (filters.localId) query = query.eq('id_local', filters.localId);

    if (filters.fecha)  query = query.eq('fecha_reserva', filters.fecha);
    if (filters.estado) query = query.eq('estado', filters.estado);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data.map(row => this._toEntity(row));
  }

  async findById(id) {
    const { data, error } = await supabase
      .from('reservaciones')
      .select('*, mesas(nombre_o_numero, capacidad)')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data ? this._toEntity(data) : null;
  }

  async save(reservation) {
    const { data, error } = await supabase
      .from('reservaciones')
      .insert({
        id_local:              reservation.localId,
        id_mesa:               reservation.mesaId,
        nombre_cliente:        reservation.nombreCliente,
        telefono:              reservation.telefono,
        fecha_reserva:         reservation.fechaReserva,
        hora_reserva:          reservation.horaReserva,
        num_personas:          reservation.numPersonas,
        notas_adicionales:     reservation.notasAdicionales,
        estado:                reservation.estado || 'pendiente',
        anticipo_pagado:       reservation.anticipoPagado || false,
        monto_anticipo:        reservation.montoAnticipo || 250.00,
        metodo_pago_anticipo:  reservation.metodoPagoAnticipo
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this._toEntity(data);
  }

  async update(id, updateFields) {
    const updateData = {};
    if (updateFields.estado !== undefined)             updateData.estado = updateFields.estado;
    if (updateFields.anticipoPagado !== undefined)      updateData.anticipo_pagado = updateFields.anticipoPagado;
    if (updateFields.montoAnticipo !== undefined)       updateData.monto_anticipo = updateFields.montoAnticipo;
    if (updateFields.metodoPagoAnticipo !== undefined)  updateData.metodo_pago_anticipo = updateFields.metodoPagoAnticipo;
    if (updateFields.mesaId !== undefined)              updateData.id_mesa = updateFields.mesaId;

    const { data, error } = await supabase
      .from('reservaciones')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this._toEntity(data);
  }

  async existeChoque(mesaId, fecha, hora) {
    const { data, error } = await supabase
      .from('reservaciones')
      .select('id')
      .eq('id_mesa', mesaId)
      .eq('fecha_reserva', fecha)
      .eq('hora_reserva', hora)
      .neq('estado', 'cancelada');

    if (error) throw new Error(error.message);
    return data.length > 0;
  }

  _toEntity(row) {
    return new Reservation({
      id:                 row.id,
      localId:            row.id_local,
      mesaId:             row.id_mesa,
      nombreCliente:      row.nombre_cliente,
      telefono:           row.telefono,
      fechaReserva:       row.fecha_reserva,
      horaReserva:        row.hora_reserva,
      numPersonas:        row.num_personas,
      notasAdicionales:   row.notas_adicionales,
      estado:             row.estado,
      anticipoPagado:     row.anticipo_pagado,
      montoAnticipo:      parseFloat(row.monto_anticipo || 250),
      metodoPagoAnticipo: row.metodo_pago_anticipo,
      creadoAt:           row.creado_at
    });
  }
}

module.exports = SupabaseReservationRepository;
