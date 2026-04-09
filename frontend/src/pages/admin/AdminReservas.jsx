import React, { useEffect, useState } from 'react';
import { supabase } from '../../api/supabaseClient';
import { Calendar, Users, Clock, CheckCircle, XCircle, DollarSign, MessageSquare, LayoutDashboard, Calendar as CalendarIcon, Settings, User, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AdminReservas.css';
import './AdminDashboard.css'; // Reusing layout CSS

const AdminReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const localId = "02ef18a9-62aa-4fcd-98ee-1134e4aaf197"; // Sucursal Timucuy

  useEffect(() => {
    fetchReservas();
  }, []);

  const fetchReservas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reservaciones')
      .select('*')
      .eq('id_local', localId)
      .order('fecha_reserva', { ascending: true })
      .order('hora_reserva', { ascending: true });
    
    if (error) console.error("Error al cargar reservas:", error);
    else setReservas(data || []);
    setLoading(false);
  };

  const handleConfirmarAnticipo = async (id) => {
    const { error } = await supabase
      .from('reservaciones')
      .update({ 
        anticipo_pagado: true, 
        estado: 'aceptada' 
      })
      .eq('id', id);

    if (!error) fetchReservas();
  };

  return (
    <div className="admin-layout">
      {/* SIDEBAR REUTILIZADO */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <img src="/src/assets/logo.png" alt="Como en Casa" className="sidebar-logo" />
          <h2 className="sidebar-brand-name">Como en Casa</h2>
        </div>
        <nav className="sidebar-nav">
          <button className="sidebar-nav-item" onClick={() => navigate('/admin')}>
            <LayoutDashboard size={20} />
            Panel Recepción
          </button>
          <button className="sidebar-nav-item active">
            <CalendarIcon size={20} />
            Reservaciones
          </button>
          <button className="sidebar-nav-item" onClick={() => navigate('/admin/menu')}>
            <Utensils size={20} />
            Gestión de Menú
          </button>
          <button className="sidebar-nav-item">
            <Settings size={20} />
            Ajustes (Pronto)
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="user-profile">
            <User size={32} className="user-avatar" />
            <div className="user-info">
              <span className="user-name">Admin Timucuy</span>
              <span className="status-badge-sidebar">En Línea</span>
            </div>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-info">
            <h1 className="dashboard-title">Agenda de Reservaciones</h1>
            <p className="dashboard-subtitle">Control de anticipos y mesas - Timucuy</p>
          </div>
          <div className="header-actions">
            <div className="reserva-stats-badge">
              <span>Total hoy:</span>
              <strong>{reservas.length}</strong>
            </div>
          </div>
        </header>

        <main className="reservas-board">
          {loading ? (
            <div className="loading-state">Cargando agenda...</div>
          ) : (
            <div className="reservas-list">
              {reservas.length === 0 ? (
                <div className="empty-reservas">
                    <p>No hay reservaciones registradas aún.</p>
                </div>
              ) : (
                reservas.map((res) => (
                  <div key={res.id} className="reserva-card">
                    
                    {/* Cliente e Info Principal */}
                    <div className="reserva-client">
                      <div className="res-icon-wrapper">
                        <Calendar size={24} />
                      </div>
                      <div className="res-client-info">
                        <h3>{res.nombre_cliente}</h3>
                        <p className="res-phone">{res.telefono}</p>
                        <p className="res-date">{new Date(res.fecha_reserva).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Horario y Personas */}
                    <div className="reserva-time">
                      <div className="res-time-item">
                        <Clock size={16} />
                        <span>{res.hora_reserva.slice(0, 5)} hrs</span>
                      </div>
                      <div className="res-time-item text-muted">
                        <Users size={16} />
                        <span>{res.num_personas} personas</span>
                      </div>
                    </div>

                    {/* Notas Adicionales */}
                    <div className="reserva-notes">
                        <MessageSquare size={16} />
                        <p>{res.notas_adicionales || "Sin notas adicionales"}</p>
                    </div>

                    {/* Estatus Anticipo $250 */}
                    <div className="reserva-status">
                        <div className={`status-pill ${res.anticipo_pagado ? 'pagado' : 'pendiente'}`}>
                            <DollarSign size={14} />
                            {res.anticipo_pagado ? 'ANTICIPO RECIBIDO' : 'PENDIENTE $250.00'}
                        </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="reserva-actions">
                      {!res.anticipo_pagado && (
                        <button 
                          onClick={() => handleConfirmarAnticipo(res.id)}
                          className="btn-confirm-res"
                          title="Marcar como pagado"
                        >
                          <CheckCircle size={22} />
                        </button>
                      )}
                      <button className="btn-cancel-res" title="Cancelar reservación">
                        <XCircle size={22} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminReservas;
