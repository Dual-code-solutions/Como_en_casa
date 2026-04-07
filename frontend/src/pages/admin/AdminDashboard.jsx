import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { Bell, Play, CheckCircle, Package, LayoutDashboard, Settings, User, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '../../api/supabaseClient';
import './AdminDashboard.css';

// Conexión al servidor de Node.js
const socket = io('http://localhost:3000');

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const localId = "02ef18a9-62aa-4fcd-98ee-1134e4aaf197"; // Timucuy

  useEffect(() => {
    // 0. Cargar pedidos existentes al iniciar
    const fetchInitialOrders = async () => {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id_local', localId)
        .neq('estado', 'finalizado')
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setOrders(data);
      }
    };
    fetchInitialOrders();

    // 1. Unirse al "cuarto" privado de la sucursal
    socket.emit('join_local', localId);

    // 2. Escuchar nuevos pedidos ("El Despertador")
    socket.on('new_order', (newOrder) => {
      const audio = new Audio('/alert.mp3'); 
      audio.play().catch(e => console.log("Esperando interacción para sonar"));
      
      const fullOrder = {
          id: newOrder.orderId,
          nombre_cliente: newOrder.customer.name,
          estado: 'entrante',
          modalidad: newOrder.deliveryType,
          numero_mesa: newOrder.customer.table || '-'
      };

      setOrders((prev) => [fullOrder, ...prev]);
    });

    return () => socket.off('new_order');
  }, []);

  const advanceOrder = async (order) => {
    let nextState = '';
    if (order.estado === 'entrante') nextState = 'cocina';
    else if (order.estado === 'cocina') nextState = 'listo';
    else if (order.estado === 'listo') nextState = 'finalizado';
    
    if (!nextState) return;

    // Actualizar optimísticamente en la UI
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, estado: nextState } : o));

    // Persistir en base de datos
    await supabase
        .from('pedidos')
        .update({ estado: nextState })
        .eq('id', order.id);
  };

  // Columnas del Kanban
  const states = [
    { id: 'entrante', label: 'Entrantes', className: 'entrante', icon: Bell },
    { id: 'cocina', label: 'En Cocina', className: 'cocina', icon: Play },
    { id: 'listo', label: 'Listos', className: 'listo', icon: CheckCircle },
    { id: 'finalizado', label: 'Entregados', className: 'finalizado', icon: Package },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar Overlay for Mobile could be added here later */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <img src="/src/assets/logo.png" alt="Como en Casa" className="sidebar-logo" />
          <h2 className="sidebar-brand-name">Como en Casa</h2>
        </div>
        <nav className="sidebar-nav">
          <button className="sidebar-nav-item active">
            <LayoutDashboard size={20} />
            Panel Recepción
          </button>
          <button className="sidebar-nav-item" onClick={() => navigate('/admin/reservas')}>
            <CalendarIcon size={20} />
            Reservaciones
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

      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-info">
            <h1 className="dashboard-title">Recepción de Pedidos</h1>
            <p className="dashboard-subtitle">Gestiona en tiempo real los pedidos de la sucursal Timucuy.</p>
          </div>
          <div className="header-actions">
            <div className="status-indicator">
              <div className="status-dot pulse"></div>
              <span>Sistema Activo</span>
            </div>
          </div>
        </header>

        <main className="kanban-board">
          {states.map((state) => (
            <div key={state.id} className={`kanban-col ${state.className}`}>
              <div className="kanban-col-header">
                <div className="kanban-header-left">
                  <state.icon size={22} className="col-icon" />
                  <h2 className="kanban-col-title">{state.label}</h2>
                </div>
                <div className="kanban-col-count">
                  {orders.filter(o => o.estado === state.id).length}
                </div>
              </div>

              <div className="kanban-col-content">
                {orders.filter(o => o.estado === state.id).map((order, idx) => (
                  <div key={order.id} className="order-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div className="order-header">
                      <div className="order-id-badge">
                        #{String(order.id).slice(-4)}
                      </div>
                      <span className="order-time">Hace 2 min</span>
                    </div>
                    <div className="order-body">
                      <p className="order-customer">{order.nombre_cliente}</p>
                      <div className="order-tags">
                        <span className="tag-modalidad">{order.modalidad}</span>
                        <span className="tag-mesa">Mesa {order.numero_mesa}</span>
                      </div>
                    </div>
                    
                    <div className="order-actions">
                      <button className="btn-detalle">Ver Detalle</button>
                      <button className="btn-siguiente" onClick={() => advanceOrder(order)}>
                        Siguiente
                      </button>
                    </div>
                  </div>
                ))}
                {orders.filter(o => o.estado === state.id).length === 0 && (
                  <div className="empty-state">
                    <p>No hay pedidos aquí</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
