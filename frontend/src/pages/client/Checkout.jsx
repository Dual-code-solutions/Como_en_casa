import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../store/useCart';
import { User, Phone, Utensils, ShoppingBag, Truck } from 'lucide-react';
import Navbar from '../../components/client/Navbar';
import apiClient from '../../api/apiClient';
import { showAlert } from '../../utils/swalCustom';
import './Checkout.css';

const LOCAL_ID = "02ef18a9-62aa-4fcd-98ee-1134e4aaf197";

const formatMods = (modsReadable) => {
  if (!modsReadable || Object.keys(modsReadable).length === 0) return null;
  return Object.entries(modsReadable)
    .map(([name, action]) => action === 'quitar' ? `Sin ${name}` : `Extra ${name}`)
    .join(', ');
};

const Checkout = () => {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [deliveryType, setDeliveryType] = useState('local');
  const [sending, setSending] = useState(false);
  const [mesas, setMesas] = useState([]);
  const [formData, setFormData] = useState({
    name: '', phone: '', table: '', address: '', landmark: ''
  });

  React.useEffect(() => {
    const fetchMesas = async () => {
      try {
        const response = await apiClient.get(`/locales/${LOCAL_ID}/mesas`);
        if (response.data && response.data.data) {
          setMesas(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching mesas", err);
      }
    };
    fetchMesas();
  }, []);

  const handleConfirmOrder = async () => {
    if (!formData.name.trim()) return showAlert('Atención', 'Por favor, ingresa tu nombre.', 'warning');
    if (cart.length === 0) return showAlert('Atención', 'Tu carrito está vacío.', 'warning');

    setSending(true);
    try {
      const payload = {
        localId: LOCAL_ID,
        deliveryType,
        total,
        customer: {
          name: formData.name,
          phone: formData.phone,
          table: deliveryType === 'local' && formData.table ? formData.table : null,
          address: deliveryType === 'domicilio' ? formData.address : null,
          landmark: deliveryType === 'domicilio' ? formData.landmark : null
        },
        cart: cart.map(item => {
          // Convertir modsReadable {Queso: 'extra', Cebolla: 'quitar'} a array [{action, name, precioExtra}]
          const personalizacion = item.modsReadable
            ? Object.entries(item.modsReadable)
                .filter(([, action]) => action !== 'normal')
                .map(([name, action]) => {
                  const ing = item.ingredientes?.find(i => i.nombreIngrediente === name);
                  return {
                    name,
                    action,
                    precioExtra: action === 'extra' ? (parseFloat(ing?.precioExtra) || 0) : 0
                  };
                })
            : [];
          return {
            id: item.id,
            quantity: item.quantity,
            subtotal: item.subtotal,   // ya incluye el precio extra calculado en el modal
            mods: personalizacion
          };
        })

      };

      const res = await apiClient.post('/orders/confirm', payload);

      // Limpiamos carrito local y enviamos a la sala de espera
      clearCart();
      const orderId = res.data.data.orderId;
      navigate(`/status/${orderId}`);
    } catch (err) {
      console.error(err);
      const errorData = err.response?.data;
      if (errorData && errorData.errors) {
        showAlert('Atención', errorData.errors.map(e => e.message || e.msg).join('\n'), 'warning');
      } else {
        showAlert('Error', 'Hubo un error al enviar tu pedido. Intenta de nuevo.', 'error');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="checkout-page">

      <Navbar />

      <div className="checkout-container">
        {/* Cabecera del Checkout (Mismo estilo que Cart) */}
        <div className="checkout-header-row">
          <button className="checkout-back-btn" onClick={() => navigate('/cart')}>
            ← Mi carrito
          </button>
          <h1 className="checkout-main-title">Confirmar Pedido</h1>
          <div className="checkout-steps">
            <span>Carrito</span>
            <span>›</span>
            <span className="step-active">Datos</span>
            <span>›</span>
            <span>Listo</span>
          </div>
        </div>
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="checkout-form-panel">
          <h2 className="checkout-title">Detalles de tu pedido</h2>

          <div className="form-content">
            {/* Nombre y Teléfono */}
            <div className="form-group-grid">
              <div className="form-field">
                <label className="form-label">Nombre Completo</label>
                <div className="input-container">
                  <User className="input-icon" size={18} />
                  <input type="text" placeholder="¿Cómo te llamas?"
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Teléfono</label>
                <div className="input-container">
                  <Phone className="input-icon" size={18} />
                  <input type="tel" placeholder="10 dígitos"
                    className="input-field"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Modalidad */}
            <div className="form-field">
              <label className="form-label">¿Cómo prefieres comer hoy?</label>
              <div className="delivery-modes-grid">
                {[
                  { id: 'local', label: 'En el local', icon: Utensils },
                  { id: 'pasar_a_recoger', label: 'Para llevar', icon: ShoppingBag },
                  { id: 'domicilio', label: 'A domicilio', icon: Truck }
                ].map((mode) => (
                  <button key={mode.id}
                    onClick={() => setDeliveryType(mode.id)}
                    className={`delivery-mode-btn ${deliveryType === mode.id ? 'active' : ''}`}>
                    <mode.icon className="delivery-icon" size={22} />
                    <span className="delivery-label">{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Campo condicional: Mesa */}
            {deliveryType === 'local' && (
              <div className="conditional-field">
                <label className="form-label">Número de Mesa</label>
                <select
                  className="input-standalone"
                  value={formData.table}
                  onChange={(e) => setFormData({...formData, table: e.target.value})}
                >
                  <option value="">Selecciona tu mesa...</option>
                  {mesas.map(mesa => {
                    const isOcupada = mesa.estado_actual === 'ocupada';
                    return (
                      <option key={mesa.id} value={mesa.id} disabled={isOcupada}>
                        {mesa.nombre_o_numero || mesa.nombreONumero} (Cap: {mesa.capacidad}) {isOcupada ? '— (Mesa Ocupada)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Campo condicional: Domicilio */}
            {deliveryType === 'domicilio' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-field">
                  <label className="form-label">Ubicación</label>
                  <textarea placeholder="Calle, número, colonia..."
                    className="textarea-field"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="form-field">
                  <label className="form-label">Referencia</label>
                  <input type="text" placeholder="Ej: Portón café, frente al parque..."
                    className="input-standalone"
                    value={formData.landmark}
                    onChange={(e) => setFormData({...formData, landmark: e.target.value})} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: RESUMEN */}
        <div className="checkout-summary-column">
          <div className="checkout-summary-panel">

            {/* Cabecera del panel */}
            <div className="summary-header">
              <h3 className="summary-title">Resumen del pedido</h3>
            </div>

            {/* Lista de items */}
            <div className="summary-items-list">
              {cart.map((item) => (
                <div key={item.uniqueId} className="summary-item">
                  <div>
                    <p className="summary-item-name">
                      {item.quantity > 1 ? `×${item.quantity}  ` : ''}{item.nombre}
                    </p>
                    {formatMods(item.modsReadable) && (
                      <p className="summary-item-mods">{formatMods(item.modsReadable)}</p>
                    )}
                  </div>
                  <p className="summary-item-price">${(item.subtotal * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Total y botón */}
            <div className="summary-total-section">
              <p className="summary-total-label">Total estimado</p>
              <div className="summary-total-row">
                <span className="summary-total-value">${total.toFixed(2)}</span>
              </div>
              <button onClick={handleConfirmOrder} className="confirm-order-btn" disabled={sending}>
                {sending ? 'Enviando pedido...' : 'Confirmar Pedido'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
