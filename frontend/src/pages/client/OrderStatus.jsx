import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { Clock, CheckCircle, ChefHat, XCircle, ChevronLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import apiClient from '../../api/apiClient';
import './OrderStatus.css';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
// Mantener la conexión fuera para no recrearla en cada re-render si no es estrictamente necesario,
// aunque se puede instanciar adentro para manejar mejor el ciclo de vida.
let socket;

const OrderStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial details
  const fetchOrder = async () => {
    try {
      const res = await apiClient.get(`/orders/${id}`);
      if (res.data && res.data.data) {
        setOrder(res.data.data);
        return res.data.data.localId;
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo encontrar tu pedido.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let localIdToJoin = null;

    const setupSocket = async () => {
      localIdToJoin = await fetchOrder();

      if (localIdToJoin) {
        if (!socket) socket = io(WS_URL);
        
        // El cliente se une a la sala del local para escuchar la campana!
        socket.emit('join_local', localIdToJoin);

        // Escuchar si SU orden se actualiza
        socket.on('order_updated', (payload) => {
          if (payload.orderId === id) {
            // Refrescar toda la orden para traer el tiempo de espera o motivo actualizado
            fetchOrder();
          }
        });
      }
    };

    setupSocket();

    return () => {
      if (socket) {
        socket.off('order_updated');
        // No desconectamos para no romper otras partes, solo dejamos de escuchar
      }
    };
  }, [id]);

  if (loading) return <div className="status-loading">Cargando progreso...</div>;
  if (error || !order) return <div className="status-error">{error || "Pedido no encontrado"}</div>;

  const isCancelado = order.estado === 'cancelado';
  const isFinalizado = order.estado === 'finalizado';

  // Configuración de los pasos
  const steps = [
    { key: 'entrante', label: 'Enviado', icon: Clock },
    { key: 'cocina', label: 'Preparando', icon: ChefHat },
    { key: 'listo', label: '¡Listo!', icon: CheckCircle }
  ];

  const getCurrentStepIndex = () => {
    if (order.estado === 'entrante') return 0;
    if (order.estado === 'cocina') return 1;
    if (order.estado === 'listo' || order.estado === 'finalizado') return 2;
    return -1;
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="status-page">
      <div className="status-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ChevronLeft size={24} /> Volver al menú
        </button>
      </div>

      <div className="status-container">
        <div className="ticket-card">
          <div className="ticket-header">
            <h2>Pedido Confirmado</h2>
            {order.numOrdenDia && (
              <div className="ticket-number">
                <span>Orden #</span>
                <strong>{order.numOrdenDia}</strong>
              </div>
            )}
          </div>

          <div className="customer-greeting">
            Hola, <strong>{order.nombreCliente}</strong>. 
            Así va tu orden hecha a las {new Date(order.creadoAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>

          {!isCancelado && !isFinalizado && (
            <div className="progress-tracker">
              {steps.map((step, idx) => {
                const isActive = idx === currentIndex;
                const isCompleted = idx < currentIndex;
                const StepIcon = step.icon;
                
                let iconClass = "step-icon ";
                if (isActive) iconClass += "active pulse";
                else if (isCompleted) iconClass += "completed";
                else iconClass += "pending";

                return (
                  <div key={step.key} className="progress-step">
                    <div className={iconClass}>
                      <StepIcon size={24} />
                    </div>
                    <span className={`step-label ${isActive || isCompleted ? 'active-text' : ''}`}>
                      {step.label}
                    </span>
                    {idx < steps.length - 1 && (
                      <div className={`step-line ${isCompleted ? 'line-filled' : ''}`}></div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {isCancelado && (
            <div className="alert-box alert-danger">
              <XCircle size={32} />
              <h3>Tu pedido fue rechazado/cancelado</h3>
              <p>{order.motivoCancelacion || 'No pudimos procesar tu orden en este momento.'}</p>
            </div>
          )}

          {order.estado === 'entrante' && (
            <div className="alert-box alert-warning">
              <div className="loader-spinner"></div>
              <p>El restaurante está revisando tu orden. En breve te asignarán un tiempo estimado.</p>
            </div>
          )}

          {order.estado === 'cocina' && order.tiempoEsperaMinutos && (
            <div className="alert-box alert-success">
              <Clock size={28} />
              <div>
                <h3>¡Manos a la obra!</h3>
                <p>Tu orden está en la cocina. Estará lista en aproximadamente <strong>{order.tiempoEsperaMinutos} minutos</strong>.</p>
              </div>
            </div>
          )}

          {order.estado === 'listo' && (
            <div className="alert-box alert-ready">
              <CheckCircle size={32} />
              <div>
                <h3>¡Tu orden está lista!</h3>
                <p>
                  {order.modalidad === 'local' ? 'Ya puedes disfrutar de tu platillo en tu mesa.' : 
                   order.modalidad === 'pasar_a_recoger' ? 'Acércate al mostrador a recogerla con tu número de orden.' : 
                   'El repartidor va en camino a tu domicilio.'}
                </p>
              </div>
            </div>
          )}

          <div className="ticket-details">
            <h4>Resumen ({order.items?.length} producto{order.items?.length !== 1 ? 's' : ''})</h4>
            <div className="ticket-items">
              {order.items?.map((item, i) => {
                const mods = Array.isArray(item.personalizacion) ? item.personalizacion : [];
                const unitPrice = parseFloat(item.subtotal) || 0;
                const lineTotal = unitPrice * (item.cantidad || 1);
                return (
                  <div key={i} className="ticket-row-group">
                    <div className="ticket-row">
                      <span className="ticket-item-name">{item.cantidad}× {item.productos?.nombre}</span>
                      <span className="ticket-item-price">${lineTotal.toFixed(2)}</span>
                    </div>
                    {mods.length > 0 && (
                      <div className="ticket-mods">
                        {mods.map((mod, mi) => (
                          <span key={mi} className={`ticket-mod ticket-mod-${mod.action}`}>
                            {mod.action === 'quitar'
                              ? `Sin ${mod.name}`
                              : `+ Extra ${mod.name} (+$${parseFloat(mod.precioExtra || 0).toFixed(2)})`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="ticket-total">
              <span>Total Pago</span>
              <span>${Number(order.total).toFixed(2)}</span>
            </div>
          </div>

          <div className="kiosk-handoff" style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
            <p style={{ marginBottom: '12px', fontSize: '15px', color: '#555', lineHeight: '1.4' }}>
              <strong>¿Vas a comer en el local?</strong><br />
              Escanea este código con tu celular para llevarte este monitor de progreso y <b>liberar la tablet</b> para el siguiente cliente.
            </p>
            <div style={{ display: 'inline-block', padding: '10px', background: 'white', borderRadius: '8px', border: '1px solid #ddd' }}>
              <QRCodeSVG value={window.location.href} size={140} level={"L"} />
            </div>
            
            <button 
              onClick={() => navigate('/')}
              style={{
                display: 'block', width: '100%', marginTop: '20px', padding: '16px',
                backgroundColor: '#d84e24', color: 'white', border: 'none',
                borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              Liberar Tablet (Nuevo Cliente)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;
