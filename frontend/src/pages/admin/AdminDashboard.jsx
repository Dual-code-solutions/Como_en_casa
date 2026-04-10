import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Bell, Play, CheckCircle, Eye } from 'lucide-react';
import apiClient from '../../api/apiClient';
import AdminSidebar from '../../components/admin/AdminSidebar';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';
import './AdminDashboard.css';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
const socket = io(WS_URL);

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mesasDict, setMesasDict] = useState({});
  const localId = "02ef18a9-62aa-4fcd-98ee-1134e4aaf197"; // Timucuy

  useEffect(() => {
    // 0. Cargar pedidos existentes al iniciar
    const fetchInitialOrders = async () => {
      try {
        const [response, mesasRes] = await Promise.all([
          apiClient.get(`/orders?localId=${localId}`),
          apiClient.get(`/locales/${localId}/mesas`)
        ]);
        
        // Build mesa dictionary
        const mDict = {};
        if (mesasRes.data?.data) {
          mesasRes.data.data.forEach(m => mDict[m.id] = m.nombre_o_numero || m.nombreONumero);
        }
        setMesasDict(mDict);

        if (response.data && response.data.data) {
          const activeOrders = response.data.data.filter(o => o.estado !== 'finalizado');
          setOrders(activeOrders);
        }
      } catch (error) {
        console.error("Error fetching orders / mesas:", error);
      }
    };
    fetchInitialOrders();

    // 1. Unirse al "cuarto" privado de la sucursal
    socket.emit('join_local', { localId });

    // 2. Escuchar nuevos pedidos ("El Despertador")
    socket.on('new_order', (newOrder) => {
      const audio = new Audio('/alert.mp3'); 
      audio.play().catch(e => console.log("Esperando interacción para sonar"));
      
      const fullOrder = {
          id: newOrder.orderId,
          nombreCliente: newOrder.customer.name,
          estado: 'entrante',
          modalidad: newOrder.deliveryType,
          mesaId: newOrder.customer.table || '-',
          creadoAt: new Date().toISOString()
      };

      setOrders((prev) => [fullOrder, ...prev]);
    });

    return () => socket.off('new_order');
  }, []);

  const handleOrderUpdated = (orderId, nuevoEstado) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, estado: nuevoEstado } : o));
  };

  const handleViewDetails = (orderId) => {
    setSelectedOrderId(orderId);
    setIsModalOpen(true);
  };

  const states = [
    { id: 'entrante', label: 'Entrantes', icon: Bell },
    { id: 'cocina',   label: 'En Cocina', icon: Play },
    { id: 'listo',    label: 'Listos',    icon: CheckCircle },
  ];

  // Avance de estado — finalizado va al Historial (se saca del Kanban)
  const advanceOrder = async (order) => {
    let nextState = '';
    if (order.estado === 'cocina')  nextState = 'listo';
    else if (order.estado === 'listo') nextState = 'finalizado';
    if (!nextState) return;

    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, estado: nextState } : o));
    try {
      await apiClient.patch(`/orders/${order.id}/estado`, { estado: nextState });
      if (nextState === 'finalizado') {
        setTimeout(() => {
          setOrders(prev => prev.filter(o => o.id !== order.id));
        }, 600);
      }
    } catch (e) {
      console.error('Error actualizando pedido', e);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

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
            <div key={state.id} className={`kanban-col ${state.id}`}>
              <div className="kanban-col-header">
                <div className="kanban-header-left">
                  <state.icon size={20} className="col-icon" />
                  <h2 className="kanban-col-title">{state.label}</h2>
                </div>
                <div className="kanban-col-count">
                  {orders.filter(o => o.estado === state.id).length}
                </div>
              </div>

              <div className="kanban-col-content">
                {orders.filter(o => o.estado === state.id).map((order, idx) => {
                  const modalidadMap = { local: 'En Local', domicilio: 'Domicilio', pasar_a_recoger: 'Para Llevar' };
                  const modalidadLabel = modalidadMap[order.modalidad] || order.modalidad;
                  const timeAgo = order.creadoAt
                    ? (() => {
                        const diff = Math.floor((Date.now() - new Date(order.creadoAt)) / 60000);
                        if (diff < 1) return 'Ahora mismo';
                        if (diff === 1) return 'Hace 1 min';
                        if (diff < 60) return `Hace ${diff} min`;
                        return `Hace ${Math.floor(diff/60)}h`;
                      })()
                    : '';

                  return (
                  <div key={order.id} className="order-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                    {/* Header */}
                    <div className="order-header">
                      <div className="order-id-badge">
                        #{order.numOrdenDia ? String(order.numOrdenDia).padStart(3, '0') : String(order.id).slice(-4)}
                      </div>
                      {timeAgo && <span className="order-time">{timeAgo}</span>}
                    </div>

                    {/* Body */}
                    <div className="order-body">
                      <p className="order-customer">{order.nombreCliente}</p>
                      <div className="order-tags">
                        <span className={`tag-modalidad tag-${order.modalidad}`}>{modalidadLabel}</span>
                        {order.mesaId && order.mesaId !== '-' && (
                          <span className="tag-mesa" style={{ textTransform: 'capitalize' }}>
                            {mesasDict[order.mesaId] || `Mesa ${String(order.mesaId).slice(-4)}`}
                          </span>
                        )}
                        {order.tiempoEsperaMinutos && (
                          <span className="tag-tiempo">⏱ {order.tiempoEsperaMinutos} min</span>
                        )}
                      </div>
                      {order.total && (
                        <div className="order-total">${Number(order.total).toFixed(2)}</div>
                      )}
                    </div>

                    {/* Footer / Actions */}
                    <div className="order-actions">
                      {state.id === 'entrante' ? (
                        <button className="btn-siguiente btn-atender" onClick={() => handleViewDetails(order.id)}>
                          <Eye size={15} /> Atender Pedido
                        </button>
                      ) : (
                        <>
                          <button className="btn-detalle" onClick={() => handleViewDetails(order.id)}>Ver Detalle</button>
                          <button className="btn-siguiente" onClick={() => advanceOrder(order)}>
                            {state.id === 'cocina' ? '✓ Listo' : '📦 Entregar'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  );
                })}
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

      <OrderDetailsModal 
        orderId={selectedOrderId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onOrderUpdated={handleOrderUpdated}
      />
    </div>
  );
};

export default AdminDashboard;
