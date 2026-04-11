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
          mesasRes.data.data.forEach(m => {
            const nombre = m.nombre_o_numero || m.nombreONumero || '';
            const desc = m.descripcion ? m.descripcion : '';
            mDict[m.id] = { nombre, desc };
          });
        }
        setMesasDict(mDict);

        if (response.data && response.data.data) {
          const activeOrders = response.data.data.filter(o => !['cancelado', 'rechazado'].includes(o.estado));
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
          numOrdenDia: newOrder.numOrdenDia || null,
          nombreCliente: newOrder.customer.name,
          estado: 'entrante',
          modalidad: newOrder.deliveryType,
          mesaId: newOrder.customer.table || '-',
          total: newOrder.total || null,
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
    { id: 'entrante',   label: 'Entrantes',  icon: Bell },
    { id: 'cocina',     label: 'En Cocina',  icon: Play },
    { id: 'listo',      label: 'Listos',     icon: CheckCircle },
    { id: 'finalizado', label: 'Entregados', icon: Eye },
  ];

  // Avance de estado
  const advanceOrder = async (order) => {
    let nextState = '';
    if (order.estado === 'cocina')  nextState = 'listo';
    else if (order.estado === 'listo') nextState = 'finalizado';
    if (!nextState) return;

    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, estado: nextState } : o));
    try {
      await apiClient.patch(`/orders/${order.id}/estado`, { estado: nextState });
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
                  // COLUMNA FINALIZADO — fila compacta
                  if (state.id === 'finalizado') {
                    const mesaInfo = order.mesaId && order.mesaId !== '-' ? (mesasDict[order.mesaId] || { nombre: `Mesa ${String(order.mesaId).slice(-4)}`, desc: '' }) : null;
                    const timeAgo = order.creadoAt
                      ? (() => {
                          const diff = Math.floor((Date.now() - new Date(order.creadoAt)) / 60000);
                          if (diff < 1) return 'Ahora';
                          if (diff < 60) return `${diff}m`;
                          return `${Math.floor(diff/60)}h`;
                        })()
                      : '';
                    return (
                      <div key={order.id} className="entregado-row" style={{ animationDelay: `${idx * 0.05}s` }}>
                        {/* #Número */}
                        <div className="entregado-pill">
                          #{order.numOrdenDia ? String(order.numOrdenDia).padStart(3, '0') : String(order.id).slice(-4)}
                        </div>
                        {/* Info central */}
                        <div className="entregado-info">
                          <span className="entregado-nombre">{order.nombreCliente}</span>
                          {mesaInfo && (
                            <span className="entregado-mesa">
                              {mesaInfo.nombre}{mesaInfo.desc ? ` · ${mesaInfo.desc}` : ''}
                            </span>
                          )}
                        </div>
                        {/* Precio + tiempo */}
                        <div className="entregado-meta">
                          {order.total && <span className="entregado-precio">${Number(order.total).toFixed(2)}</span>}
                          {timeAgo && <span className="entregado-time">{timeAgo}</span>}
                        </div>
                        {/* Botón Ver */}
                        <button className="btn-ver-entregado" onClick={() => handleViewDetails(order.id)}>Ver</button>
                      </div>
                    );
                  }

                  // RESTO DE COLUMNAS — tarjeta normal
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

                  const isCocina = state.id === 'cocina';
                  const isEntrante = state.id === 'entrante';
                  const isListo = state.id === 'listo';
                  const isNormal = !isCocina && !isEntrante && !isListo;
                  const mesaInfo = order.mesaId && order.mesaId !== '-' ? (mesasDict[order.mesaId] || { nombre: `Mesa ${String(order.mesaId).slice(-4)}`, desc: '' }) : null;

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
                      
                      {isNormal && (
                        <>
                          <div className="order-tags">
                            <span className={`tag-modalidad tag-${order.modalidad}`}>{modalidadLabel}</span>
                            {mesaInfo && (
                              <span className="tag-mesa" style={{ textTransform: 'capitalize' }}>
                                {mesaInfo.nombre} {mesaInfo.desc ? `- ${mesaInfo.desc}` : ''}
                              </span>
                            )}
                            {order.tiempoEsperaMinutos && (
                              <span className="tag-tiempo">⏱ {order.tiempoEsperaMinutos} min</span>
                            )}
                          </div>
                          {order.total && (
                            <div className="order-total-normal">${Number(order.total).toFixed(2)}</div>
                          )}
                        </>
                      )}

                      {isCocina && (
                        <>
                          <div className="orden-tipo-wrapper">
                            <span className={`tag-modalidad tag-${order.modalidad}`}>{modalidadLabel}</span>
                          </div>
                          
                          {mesaInfo && (
                            <div className="mesa-block-detallado">
                              <div className="mesa-info-row">
                                <span className="mesa-row-label">MESA</span>
                                <span className="mesa-row-value-bold">{mesaInfo.nombre}</span>
                              </div>
                              {mesaInfo.desc && (
                                <div className="mesa-info-row">
                                  <span className="mesa-row-label">DESCRIPCIÓN</span>
                                  <span className="mesa-row-value-sub">{mesaInfo.desc}</span>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="orden-info-bottom">
                            {order.tiempoEsperaMinutos ? (
                              <span className="tag-tiempo">⏱ {order.tiempoEsperaMinutos} min</span>
                            ) : <div></div>}
                            
                            {order.total && (
                              <div className="order-total-cocina">${Number(order.total).toFixed(2)}</div>
                            )}
                          </div>
                        </>
                      )}

                      {isEntrante && (
                        <>
                          <div className="orden-tipo-wrapper">
                            <span className={`tag-modalidad tag-${order.modalidad}`}>{modalidadLabel}</span>
                          </div>
                          
                          {mesaInfo && (
                            <div className="mesa-block-detallado">
                              <div className="mesa-info-row">
                                <span className="mesa-row-label">MESA</span>
                                <span className="mesa-row-value-bold">{mesaInfo.nombre}</span>
                              </div>
                              {mesaInfo.desc && (
                                <div className="mesa-info-row">
                                  <span className="mesa-row-label">DESCRIPCIÓN</span>
                                  <span className="mesa-row-value-sub">{mesaInfo.desc}</span>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="orden-info-bottom">
                            <div className="filler-div"></div>
                            {order.total && (
                              <div className="order-total-cocina">${Number(order.total).toFixed(2)}</div>
                            )}
                          </div>
                        </>
                      )}
                      {isListo && (
                        <>
                          {/* Badges: tipo + tiempo en misma fila */}
                          <div className="order-tags">
                            <span className={`tag-modalidad tag-${order.modalidad}`}>{modalidadLabel}</span>
                            {order.tiempoEsperaMinutos && (
                              <span className="tag-tiempo">⏱ {order.tiempoEsperaMinutos} min</span>
                            )}
                          </div>

                          {/* Bloque mesa detallado */}
                          {mesaInfo && (
                            <div className="mesa-block-detallado">
                              <div className="mesa-info-row">
                                <span className="mesa-row-label">MESA</span>
                                <span className="mesa-row-value-bold">{mesaInfo.nombre}</span>
                              </div>
                              {mesaInfo.desc && (
                                <div className="mesa-info-row">
                                  <span className="mesa-row-label">DESCRIPCIÓN</span>
                                  <span className="mesa-row-value-sub">{mesaInfo.desc}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Precio grande naranja */}
                          {order.total && (
                            <div className="order-total-cocina">${Number(order.total).toFixed(2)}</div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Footer / Actions */}
                    <div className="order-actions">
                      {state.id === 'entrante' ? (
                        <button className="btn-siguiente btn-atender default-full-width" onClick={() => handleViewDetails(order.id)}>
                          Atender Pedido
                        </button>
                      ) : state.id === 'finalizado' ? (
                        <button className="btn-detalle" style={{ flex: 1 }} onClick={() => handleViewDetails(order.id)}>
                          Historial Detalles
                        </button>
                      ) : isListo ? (
                        <>
                          <button className="btn-detalle btn-detalle-cocina" onClick={() => handleViewDetails(order.id)}>Ver Detalle</button>
                          <button className="btn-entregar-listo" onClick={() => advanceOrder(order)}>
                            ✓ Marcar Entregado
                          </button>
                        </>
                      ) : (
                        <>
                          <button className={`btn-detalle ${isCocina ? 'btn-detalle-cocina' : ''}`} onClick={() => handleViewDetails(order.id)}>Ver Detalle</button>
                          <button className={`btn-siguiente ${isCocina ? 'btn-siguiente-cocina' : ''}`} onClick={() => advanceOrder(order)}>
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
