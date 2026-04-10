import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, User, CheckCircle, XCircle, Minus, Plus } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { showAlert } from '../../utils/swalCustom';
import './OrderDetailsModal.css';

const PRESETS = [10, 15, 20, 30, 45];

const LOCAL_ID = '02ef18a9-62aa-4fcd-98ee-1134e4aaf197';

const modalidadLabel = (m, mesaId, nombreMesa) => {
  if (m === 'local') {
    if (nombreMesa) return `En Local · ${nombreMesa}`;
    if (mesaId) return `En Local · Mesa (ID: ${String(mesaId).slice(-4)})`;
    return 'En Local';
  }
  if (m === 'domicilio') return 'A Domicilio';
  return 'Para Llevar';
};

const OrderDetailsModal = ({ orderId, isOpen, onClose, onOrderUpdated }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [tiempoEspera, setTiempoEspera] = useState(15);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
      setShowRejectForm(false);
      setMotivoRechazo('');
      setTiempoEspera(15);
    }
  }, [isOpen, orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/orders/${orderId}`);
      const data = res.data?.data;
      if (data) {
        if (data.modalidad === 'local' && data.mesaId) {
          try {
            const mesasRes = await apiClient.get(`/locales/${LOCAL_ID}/mesas`);
            const mesas = mesasRes.data?.data || [];
            const objMesa = mesas.find(m => m.id === data.mesaId);
            if (objMesa) {
              data.nombreMesa = objMesa.nombre_o_numero || objMesa.nombreONumero;
            }
          } catch(e) {
            console.error('Error fetching mesas mapping', e);
          }
        }
        setOrder(data);
      }
    } catch (err) {
      console.error('Error fetching order details', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAceptar = async () => {
    setActionLoading(true);
    try {
      await apiClient.patch(`/orders/${orderId}/estado`, {
        estado: 'cocina',
        tiempoEsperaMinutos: tiempoEspera || 15
      });

      // Si es modalidad local y tiene mesa asignada, ocuparla automáticamente.
      if (order.modalidad === 'local' && order.mesaId) {
        try {
          await apiClient.patch(`/locales/${LOCAL_ID}/mesas/${order.mesaId}/estado`, { 
            estado_actual: 'ocupada' 
          });
        } catch (tableErr) {
          console.error('Error al intentar marcar la mesa como ocupada:', tableErr);
        }
      }

      onOrderUpdated(orderId, 'cocina');
      onClose();
    } catch (e) {
      showAlert('Error', 'Error al aceptar pedido', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRechazar = async () => {
    if (!motivoRechazo.trim()) {
      showAlert('Atención', 'Por favor indica un motivo para el rechazo', 'warning');
      return;
    }
    setActionLoading(true);
    try {
      await apiClient.patch(`/orders/${orderId}/estado`, {
        estado: 'cancelado'
      });
      onOrderUpdated(orderId, 'cancelado');
      onClose();
    } catch (e) {
      showAlert('Error', 'Error al rechazar pedido', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const adjust = (delta) =>
    setTiempoEspera(prev => Math.max(1, Math.min(120, prev + delta)));

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-order-details">
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {loading ? (
          <div className="loading-state">Cargando detalles…</div>
        ) : order ? (
          <>
            {/* ── PREMIUM HEADER ── */}
            <div className="order-details-header">
              <div>
                <h2>Pedido #{order.numOrdenDia ? String(order.numOrdenDia).padStart(3,'0') : String(order.id).slice(-4)}</h2>
                <div className="order-meta-info">
                  <span className="orden-dia">Orden del día #{order.numOrdenDia || '?'}</span>
                  <span className={`estado-badge estado-${order.estado}`}>
                    {order.estado.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="order-total-price">
                ${Number(order.total).toFixed(2)}
              </div>
            </div>

            {/* ── BODY ── */}
            <div className="modal-body-content">

              {/* Info grid */}
              <div className="order-info-grid">
                <div className="info-block">
                  <User size={18} className="info-icon" />
                  <div>
                    <p className="info-label">Cliente</p>
                    <p className="info-value">{order.nombreCliente}</p>
                    <p className="info-subvalue">{order.telefono}</p>
                  </div>
                </div>

                <div className="info-block">
                  <MapPin size={18} className="info-icon" />
                  <div>
                    <p className="info-label">Modalidad</p>
                    <p className="info-value">{modalidadLabel(order.modalidad, order.mesaId, order.nombreMesa)}</p>
                    {order.direccionEnvio && <p className="info-subvalue">{order.direccionEnvio}</p>}
                    {order.referenciaUbicacion && <p className="info-subvalue">{order.referenciaUbicacion}</p>}
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="order-items-container">
                <h3 className="section-title">Productos en la Orden</h3>
                <ul className="order-items-list">
                  {order.items && order.items.map((item, idx) => {
                    const mods = Array.isArray(item.personalizacion) ? item.personalizacion : [];
                    const basePrice = item.productos?.precio_base || 0;
                    const extrasTotal = mods.filter(m => m.action === 'extra').reduce((s, m) => s + (m.precioExtra || 0), 0);
                    const unitPrice = parseFloat(item.subtotal) || (parseFloat(basePrice) + extrasTotal);
                    const totalLine = unitPrice * (item.cantidad || 1);

                    return (
                    <li key={idx} className="item-row">
                      <div className="item-quantity">{item.cantidad || 1}×</div>
                      <div className="item-details">
                        <p className="item-name">{item.productos?.nombre || 'Producto'}</p>
                        <p className="item-base-price">${parseFloat(basePrice).toFixed(2)} precio base</p>
                        {mods.length > 0 && (
                          <ul className="item-mods-list">
                            {mods.map((mod, mi) => (
                              <li key={mi} className={`item-mod mod-${mod.action}`}>
                                {mod.action === 'quitar'
                                  ? `− Sin ${mod.name}`
                                  : `+ Extra ${mod.name}  +$${parseFloat(mod.precioExtra).toFixed(2)}`}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="item-price">${totalLine.toFixed(2)}</div>
                    </li>
                    );
                  })}
                </ul>
              </div>

              {/* Actions — only for incoming orders */}
              {order.estado === 'entrante' && (
                <div className="order-actions-panel">
                  {!showRejectForm ? (
                    <>
                      {/* ── TIME PICKER HERO ── */}
                      <div className="time-picker-block">
                        <div className="time-picker-label">
                          <Clock size={20} />
                          Tiempo de preparación
                        </div>
                        <div className="time-picker-controls">
                          <button type="button" className="time-btn" onClick={() => adjust(-5)}>−</button>
                          <input
                            className="time-display"
                            type="number"
                            min="1" max="120"
                            value={tiempoEspera}
                            onChange={e => setTiempoEspera(parseInt(e.target.value) || 1)}
                          />
                          <span style={{ fontWeight:700, fontSize:'1.1rem', color:'#8B4513' }}>min</span>
                          <button type="button" className="time-btn" onClick={() => adjust(5)}>+</button>
                        </div>
                      </div>

                      {/* Quick presets */}
                      <div className="time-presets">
                        {PRESETS.map(p => (
                          <button
                            key={p}
                            type="button"
                            className={`time-preset-btn ${tiempoEspera === p ? 'active' : ''}`}
                            onClick={() => setTiempoEspera(p)}
                          >
                            {p} min
                          </button>
                        ))}
                      </div>

                      {/* Accept / Reject buttons */}
                      <div className="action-buttons">
                        <button
                          className="btn-reject"
                          onClick={() => setShowRejectForm(true)}
                          disabled={actionLoading}
                        >
                          <XCircle size={17} /> Rechazar
                        </button>
                        <button
                          className="btn-accept"
                          onClick={handleAceptar}
                          disabled={actionLoading}
                        >
                          <CheckCircle size={17} /> Aceptar y enviar a cocina
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="reject-form">
                      <label>Motivo de rechazo:</label>
                      <textarea
                        placeholder="Ej: Insumos agotados, fuera de horario…"
                        value={motivoRechazo}
                        onChange={e => setMotivoRechazo(e.target.value)}
                        rows={3}
                      />
                      <div className="action-buttons">
                        <button className="btn-secondary" onClick={() => setShowRejectForm(false)}>
                          Cancelar
                        </button>
                        <button
                          className="btn-reject"
                          onClick={handleRechazar}
                          disabled={actionLoading}
                        >
                          <XCircle size={16} /> Confirmar Rechazo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="error-state">No se pudo cargar el pedido.</div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsModal;
