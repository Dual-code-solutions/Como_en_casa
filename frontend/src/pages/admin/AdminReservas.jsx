import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { io } from 'socket.io-client';
import { Calendar, Users, Clock, CheckCircle, XCircle, DollarSign, MessageSquare, RefreshCw } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { showAlert, showConfirm } from '../../utils/swalCustom';
import './AdminReservas.css';
import './AdminDashboard.css';

const LOCAL_ID = '02ef18a9-62aa-4fcd-98ee-1134e4aaf197';

const ESTADO_LABELS = {
  pendiente: { label: 'Pendiente', cls: 'estado-pendiente' },
  aceptada:  { label: 'Confirmada', cls: 'estado-aceptada' },
  cancelada: { label: 'Cancelada', cls: 'estado-cancelada' }
};

const AdminReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState('pendiente');

  const fetchReservas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ localId: LOCAL_ID });
      if (filterEstado !== 'all') params.set('estado', filterEstado);
      const res = await apiClient.get(`/reservaciones?${params}`);
      setReservas(res.data?.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    fetchReservas();
  }, [filterEstado]);

  useEffect(() => {
    const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
    const socket = io(WS_URL);
    socket.emit('join_local', LOCAL_ID);
    socket.on('new_reservation', fetchReservas);
    socket.on('reservation_updated', fetchReservas);
    return () => socket.disconnect();
  }, []);

  const handleConfirmar = async (id) => {
    const ok = await showConfirm('¿Confirmar reservación?', 'La reservación cambiará a estado "Aceptada" y se notificará al cliente.', 'Sí, confirmar', 'question');
    if (!ok) return;
    try {
      await apiClient.patch(`/reservaciones/${id}`, { estado: 'aceptada' });
      fetchReservas();
    } catch (e) {
      showAlert('Error', e.response?.data?.message || e.message, 'error');
    }
  };

  const handleAnticipo = async (id) => {
    const ok = await showConfirm('¿Marcar anticipo como pagado?', 'Se registrará que el cliente ya pagó los $250.00 de anticipo.', 'Sí, pagado', 'question');
    if (!ok) return;
    try {
      await apiClient.patch(`/reservaciones/${id}`, { anticipoPagado: true });
      fetchReservas();
    } catch (e) {
      showAlert('Error', e.response?.data?.message || e.message, 'error');
    }
  };

  const handleCancelar = async (id, nombre) => {
    const ok = await showConfirm('¿Cancelar reservación?', `Se cancelará la reserva de ${nombre}. Esta acción no se puede deshacer.`, 'Sí, cancelar', 'warning');
    if (!ok) return;
    try {
      await apiClient.patch(`/reservaciones/${id}`, { estado: 'cancelada' });
      fetchReservas();
    } catch (e) {
      showAlert('Error', e.response?.data?.message || e.message, 'error');
    }
  };

  const pendientesCount = reservas.filter(r => r.estado === 'pendiente').length;

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-info">
            <h1 className="dashboard-title">Agenda de Reservaciones</h1>
            <p className="dashboard-subtitle">Control de anticipos y confirmaciones · Timucuy</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {pendientesCount > 0 && (
              <span className="badge-pendientes">
                {pendientesCount} pendiente{pendientesCount > 1 ? 's' : ''}
              </span>
            )}
            <button className="btn-refresh" onClick={fetchReservas} title="Actualizar">
              <RefreshCw size={14} /> Actualizar
            </button>
          </div>
        </header>

        {/* Filtros de estado */}
        <div className="admin-category-filter" style={{ padding: '0 2rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.03)', marginBottom: '1rem' }}>
          {[['all', 'Todas'], ['pendiente', 'Pendientes'], ['aceptada', 'Confirmadas'], ['cancelada', 'Canceladas']].map(([val, lbl]) => (
            <button
              key={val}
              className={`admin-cat-btn ${filterEstado === val ? 'active' : ''}`}
              onClick={() => setFilterEstado(val)}
            >
              {lbl}
            </button>
          ))}
        </div>

        <main className="reservas-board">
          {loading ? (
            <div className="loading-state">Cargando agenda...</div>
          ) : reservas.length === 0 ? (
            <div className="historial-empty">
              <Calendar size={52} color="#ccc" />
              <p>No hay reservaciones en este estado.</p>
            </div>
          ) : (
            <div className="reservas-list">
              {reservas.map((res) => {
                const estadoInfo = ESTADO_LABELS[res.estado] || ESTADO_LABELS.pendiente;
                return (
                  <div key={res.id} className={`reserva-card ${res.estado}`}>
                    <div className="reserva-client">
                      <div className="res-icon-wrapper">
                        <Calendar size={22} />
                      </div>
                      <div className="res-client-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <h3>{res.nombreCliente}</h3>
                          <span className={`estado-pill ${estadoInfo.cls}`}>{estadoInfo.label}</span>
                        </div>
                        <p className="res-phone">{res.telefono}</p>
                        <p className="res-date">{res.fechaReserva} · {res.horaReserva?.slice(0, 5)} hrs · {res.numPersonas} personas</p>
                      </div>
                    </div>

                    {res.notasAdicionales && (
                      <div className="reserva-notes">
                        <MessageSquare size={14} />
                        <p>{res.notasAdicionales}</p>
                      </div>
                    )}

                    <div className="reserva-footer">
                      <div className={`status-pill ${res.anticipoPagado ? 'pagado' : 'pendiente'}`}>
                        <DollarSign size={13} />
                        {res.anticipoPagado ? 'Anticipo Pagado ✓' : 'Anticipo Pendiente $250'}
                      </div>

                      <div className="reserva-actions">
                        {/* Confirmar reserva (si está pendiente) */}
                        {res.estado === 'pendiente' && (
                          <button className="btn-confirm-res" onClick={() => handleConfirmar(res.id)} title="Confirmar reservación">
                            <CheckCircle size={18} /> Confirmar
                          </button>
                        )}
                        {/* Anticipo (si está aceptada y no pagado) */}
                        {res.estado === 'aceptada' && !res.anticipoPagado && (
                          <button className="btn-anticipo-res" onClick={() => handleAnticipo(res.id)} title="Marcar anticipo pagado">
                            <DollarSign size={18} /> Anticipo Pagado
                          </button>
                        )}
                        {/* Cancelar (si no está ya cancelada) */}
                        {res.estado !== 'cancelada' && (
                          <button className="btn-cancel-res" onClick={() => handleCancelar(res.id, res.nombreCliente)} title="Cancelar reservación">
                            <XCircle size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminReservas;
