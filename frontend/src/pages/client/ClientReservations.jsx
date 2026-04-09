import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { io } from 'socket.io-client';
import { Calendar, Clock, Users, Phone, User as UserIcon, MessageSquare, CheckCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/client/Navbar';
import { showAlert } from '../../utils/swalCustom';
import './ClientReservations.css';

const LOCAL_ID = '02ef18a9-62aa-4fcd-98ee-1134e4aaf197';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

/* ─────────────────────────────────────────────────────────
   Sub-componente: Sala de espera con notificación en tiempo real
   ───────────────────────────────────────────────────────── */
const ReservaStatusScreen = ({ reservaId, formData, onBack }) => {
  const [estadoReserva, setEstadoReserva] = useState('pendiente'); // 'pendiente' | 'aceptada' | 'cancelada'

  useEffect(() => {
    if (!reservaId) return;
    const socket = io(WS_URL);
    // Unirse al room personal de esta reserva
    socket.emit('join_reserva', reservaId);
    // También al room del local (el admin emite a ambos)
    socket.emit('join_local', LOCAL_ID);

    socket.on('reservation_updated', (data) => {
      if (data.reservacionId === reservaId) {
        setEstadoReserva(data.estado);
      }
    });

    return () => socket.disconnect();
  }, [reservaId]);

  const isConfirmed = estadoReserva === 'aceptada';
  const isCancelled = estadoReserva === 'cancelada';

  return (
    <div className="client-res-page">
      <Navbar />
      <div className="client-res-confirm-container">
        <div className={`res-ticket-card ${isConfirmed ? 'ticket-confirmed' : isCancelled ? 'ticket-cancelled' : ''}`}>

          {/* HEADER dinámico según estado */}
          <div className={`ticket-header ${isConfirmed ? 'header-confirmed' : isCancelled ? 'header-cancelled' : 'header-waiting'}`}>
            {isConfirmed ? (
              <><CheckCircle className="ticket-icon" size={48} />
              <h2>¡Reserva Confirmada!</h2>
              <p>Te esperamos con los brazos abiertos 🏠</p></>
            ) : isCancelled ? (
              <><div className="ticket-icon" style={{fontSize:'2.5rem'}}>&#128532;</div>
              <h2>Reserva Cancelada</h2>
              <p>Lo sentimos, tu reservación fue cancelada.</p></>
            ) : (
              <><Loader className="ticket-icon ticket-spinner" size={44} />
              <h2>Solicitud Recibida</h2>
              <p>Esperando confirmación del restaurante...</p></>
            )}
          </div>

          {/* DATOS del ticket */}
          <div className="ticket-body">
            <div className="ticket-row">
              <span className="ticket-label"><UserIcon size={14}/> Nombre</span>
              <span className="ticket-val">{formData.nombre_cliente}</span>
            </div>
            <div className="ticket-row">
              <span className="ticket-label"><Calendar size={14}/> Fecha</span>
              <span className="ticket-val">{formData.fecha_reserva}</span>
            </div>
            <div className="ticket-row">
              <span className="ticket-label"><Clock size={14}/> Hora</span>
              <span className="ticket-val">{formData.hora_reserva} hrs</span>
            </div>
            <div className="ticket-row">
              <span className="ticket-label"><Users size={14}/> Personas</span>
              <span className="ticket-val">{formData.num_personas}</span>
            </div>
            {formData.notas_adicionales && (
              <div className="ticket-row col-full">
                <span className="ticket-label"><MessageSquare size={14}/> Notas</span>
                <span className="ticket-val">{formData.notas_adicionales}</span>
              </div>
            )}
          </div>

          {/* FOOTER dinámico */}
          <div className="ticket-footer">
            {isConfirmed ? (
              <p className="ticket-note">
                ¡Excelente! Para asegurar tu lugar realiza el anticipo de <strong>$250.00</strong>.<br/>
                Te esperamos en la sucursal Timucuy. 🍽️
              </p>
            ) : isCancelled ? (
              <p className="ticket-note">
                Si crees que es un error, llámanos al número del restaurante o realiza una nueva reserva.
              </p>
            ) : (
              <p className="ticket-note">
                ⏳ Estamos notificando al equipo. Recibirdás confirmación en este mismo momento.<br/>
                No cierres esta página.
              </p>
            )}
          </div>

          <button onClick={onBack} className="btn-back-menu">
            Volver al Menú
          </button>
        </div>
      </div>
    </div>
  );
};

const ClientReservations = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [reservaId, setReservaId] = useState(null);

  // Fecha mínima = hoy
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    nombre_cliente: '',
    telefono: '',
    fecha_reserva: '',
    hora_reserva: '',
    num_personas: 2,
    notas_adicionales: ''
  });

  // Horarios ocupados para la fecha seleccionada
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const generateHours = () => {
    const hours = [];
    for (let h = 13; h <= 22; h++) {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayH = h > 12 ? h - 12 : h;
      hours.push({ value: `${h.toString().padStart(2, '0')}:00`, label: `${displayH}:00 ${ampm}` });
      if (h !== 22) {
        hours.push({ value: `${h.toString().padStart(2, '0')}:30`, label: `${displayH}:30 ${ampm}` });
      }
    }
    return hours;
  };
  const selectHours = generateHours();

  // Cuando cambia la fecha, consultar disponibilidad
  useEffect(() => {
    if (!formData.fecha_reserva) {
      setHorariosOcupados([]);
      return;
    }
    // Si la fecha es pasada, reset
    if (formData.fecha_reserva < todayStr) {
      setHorariosOcupados([]);
      return;
    }
    const fetchDisponibilidad = async () => {
      setLoadingSlots(true);
      try {
        const res = await apiClient.get(`/reservaciones/disponibilidad?localId=${LOCAL_ID}&fecha=${formData.fecha_reserva}`);
        setHorariosOcupados(res.data?.data || []);
      } catch (e) {
        console.error(e);
        setHorariosOcupados([]);
      }
      setLoadingSlots(false);
    };
    fetchDisponibilidad();
  }, [formData.fecha_reserva]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fecha_reserva || formData.fecha_reserva < todayStr) {
      return showAlert('Atención', 'La fecha seleccionada ya pasó. Elige una fecha futura.', 'warning');
    }
    if (horariosOcupados.includes(formData.hora_reserva)) {
      return showAlert('Horario no disponible', 'Ese horario ya está reservado. Por favor elige otro.', 'warning');
    }
    setLoading(true);

    try {
      await apiClient.post('/reservaciones', {
        localId: LOCAL_ID,
        nombreCliente: formData.nombre_cliente,
        telefono: formData.telefono,
        fechaReserva: formData.fecha_reserva,
        horaReserva: formData.hora_reserva,
        numPersonas: formData.num_personas,
        notasAdicionales: formData.notas_adicionales
      });

      setReservaId(res.data.data.id);
      setStep(2);
    } catch (error) {
      console.error("Error al guardar reserva:", error);
      showAlert('Error', 'Hubo un error al guardar tu reserva. Inténtalo de nuevo.', 'error');
    }
    setLoading(false);
  };

  if (step === 2) {
    return (
      <ReservaStatusScreen
        reservaId={reservaId}
        formData={formData}
        onBack={() => navigate('/')}
      />
    );
  }

  return (
    <div className="client-res-page">
      <Navbar />
      <div className="client-res-form-wrapper">
        <div className="client-res-card">
          
          <div className="client-res-header">
            <h1 className="client-res-title">Reserva tu Mesa</h1>
            <p className="client-res-subtitle">Disfruta el sabor de casa en la Sucursal Timucuy</p>
          </div>

          <form onSubmit={handleSubmit} className="client-res-form">
            
            {/* Nombre y Teléfono */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <UserIcon size={16} /> Tu Nombre
                </label>
                <input required type="text" placeholder="¿A nombre de quién?" 
                  className="form-input"
                  onChange={(e) => setFormData({...formData, nombre_cliente: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Phone size={16} /> Teléfono
                </label>
                <input required type="tel" placeholder="10 dígitos para contactarte" 
                  className="form-input"
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
              </div>
            </div>

            {/* Fecha y Hora */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} /> ¿Qué día?
                </label>
                <input required type="date" 
                  className="form-input"
                  min={todayStr}
                  value={formData.fecha_reserva}
                  onChange={(e) => {
                    setFormData({...formData, fecha_reserva: e.target.value, hora_reserva: ''});
                  }} />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Clock size={16} /> ¿A qué hora?
                </label>
                <select 
                  required 
                  className="form-input select-styled"
                  value={formData.hora_reserva}
                  onChange={(e) => setFormData({...formData, hora_reserva: e.target.value})}
                  disabled={loadingSlots || !formData.fecha_reserva}
                >
                  <option value="" disabled>
                    {loadingSlots ? 'Cargando disponibilidad...' : 'Selecciona una hora'}
                  </option>
                  {selectHours.map(h => {
                    const ocupado = horariosOcupados.includes(h.value);
                    return (
                      <option 
                        key={h.value} 
                        value={h.value} 
                        disabled={ocupado}
                        style={ocupado ? { color: '#bbb', textDecoration: 'line-through' } : {}}
                      >
                        {ocupado ? `${h.label} — Ocupado` : h.label}
                      </option>
                    );
                  })}
                </select>
                {formData.fecha_reserva && !loadingSlots && horariosOcupados.length > 0 && (
                  <p className="slots-hint">⚠️ {horariosOcupados.length} horario(s) no disponibles para esta fecha.</p>
                )}
              </div>
            </div>

            {/* Número de Personas */}
            <div className="form-group">
              <label className="form-label">
                <Users size={16} /> ¿Cuántas personas vienen?
              </label>
              <div className="counter-container">
                <button type="button" onClick={() => setFormData({...formData, num_personas: Math.max(1, formData.num_personas - 1)})}
                  className="counter-btn">-</button>
                <span className="counter-value">{formData.num_personas}</span>
                <button type="button" onClick={() => setFormData({...formData, num_personas: formData.num_personas + 1})}
                  className="counter-btn">+</button>
              </div>
            </div>

            {/* Notas */}
            <div className="form-group">
              <label className="form-label">
                <MessageSquare size={16} /> ¿Alguna nota especial?
              </label>
              <textarea placeholder="Ej: Silla para bebé, festejo de cumpleaños, etc." 
                className="form-input textarea-res"
                onChange={(e) => setFormData({...formData, notas_adicionales: e.target.value})} />
            </div>

            {/* Advertencia Anticipo */}
            <div className="res-warning-box">
              <p>
                * Nota: Para garantizar tu lugar, se requiere un anticipo de $250.00 que se descontará de tu cuenta final.
              </p>
            </div>

            <button type="submit" disabled={loading} className="btn-submit-res">
              {loading ? "Registrando..." : "Solicitar Reservación"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientReservations;
