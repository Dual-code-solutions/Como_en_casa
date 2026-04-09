import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/apiClient';
import { io } from 'socket.io-client';
import { Calendar, Clock, Users, Phone, User as UserIcon, MessageSquare, CheckCircle, Loader, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/client/Navbar';
import { showAlert } from '../../utils/swalCustom';
import { QRCodeSVG } from 'qrcode.react';
import './ClientReservations.css';

const LOCAL_ID = '02ef18a9-62aa-4fcd-98ee-1134e4aaf197';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

/* ─────────────────────────────────────────────────────────
   Sub-componente: Sala de espera con notificación en tiempo real
   ───────────────────────────────────────────────────────── */
const ReservaStatusScreen = ({ reservaId, formData, onBack }) => {
  const [estadoReserva, setEstadoReserva] = useState('pendiente'); // 'pendiente' | 'aceptada' | 'cancelada'
  const [downloading, setDownloading] = useState(false);
  const ticketRef = useRef(null);

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

  const downloadTicket = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF }       = await import('jspdf');

      // Mostrar el ticket oculto momentáneamente para capturarlo
      ticketRef.current.style.display = 'block';
      await new Promise(r => setTimeout(r, 120)); // esperar render

      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      ticketRef.current.style.display = 'none';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [90, 160] });
      pdf.addImage(imgData, 'PNG', 0, 0, 90, 160);
      pdf.save(`ticket-reserva-${formData.nombre_cliente.replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
      console.error('Error al generar ticket:', err);
      showAlert('Error', 'No se pudo generar el ticket. Intenta de nuevo.', 'error');
    }
    setDownloading(false);
  };

  // Formato legible de fecha
  const fechaFormateada = formData.fecha_reserva
    ? new Date(formData.fecha_reserva + 'T12:00:00').toLocaleDateString('es-MX', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
    : '';

  const qrData = JSON.stringify({
    restaurante: 'Como en Casa - Sucursal Timucuy',
    reserva: reservaId || 'pendiente',
    nombre: formData.nombre_cliente,
    fecha: formData.fecha_reserva,
    hora: formData.hora_reserva,
    personas: formData.num_personas
  });

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

          {isConfirmed && (
            <button
              onClick={downloadTicket}
              disabled={downloading}
              className="btn-download-ticket"
            >
              <Download size={16} />
              {downloading ? 'Generando PDF...' : 'Descargar Ticket'}
            </button>
          )}

          <button onClick={onBack} className="btn-back-menu">
            Volver al Menú
          </button>
        </div>
      </div>

      {/* ── Ticket imprimible OCULTO (solo para html2canvas) ── */}
      <div ref={ticketRef} style={{ display: 'none' }}>
        <div style={{
          width: '340px', background: '#fff', fontFamily: "'Georgia', serif",
          borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #6B2D0E 0%, #A0522D 100%)', padding: '20px 24px', textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#F5DEB3', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase' }}>Restaurante</p>
            <h2 style={{ margin: '4px 0 2px', color: '#fff', fontSize: '22px', fontWeight: 'bold' }}>Como en Casa</h2>
            <p style={{ margin: 0, color: '#F5DEB3', fontSize: '11px', letterSpacing: '2px' }}>Sucursal Timucuy</p>
          </div>

          {/* Status badge */}
          <div style={{ background: '#2d7a2d', padding: '8px 24px', textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#fff', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>✓ RESERVA CONFIRMADA</p>
          </div>

          {/* Details */}
          <div style={{ padding: '20px 24px' }}>
            {[
              { label: 'Nombre', value: formData.nombre_cliente },
              { label: 'Fecha', value: fechaFormateada },
              { label: 'Hora', value: `${formData.hora_reserva} hrs` },
              { label: 'Personas', value: `${formData.num_personas} persona${formData.num_personas > 1 ? 's' : ''}` },
              ...(formData.notas_adicionales ? [{ label: 'Notas', value: formData.notas_adicionales }] : [])
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0ece8' }}>
                <span style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'sans-serif' }}>{label}</span>
                <span style={{ color: '#3a1f0e', fontSize: '13px', fontWeight: '600', fontFamily: 'sans-serif', maxWidth: '180px', textAlign: 'right' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Anticipo notice */}
          <div style={{ background: '#fdf6f0', margin: '0 16px', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
            <p style={{ margin: 0, fontSize: '11px', color: '#8B4513', fontFamily: 'sans-serif', textAlign: 'center' }}>
              💰 Anticipo requerido: <strong>$250.00 MXN</strong><br/>
              Se descontará de tu cuenta final
            </p>
          </div>

          {/* QR Code */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 24px 16px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '10px', color: '#aaa', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: '1px' }}>Escanea para verificar</p>
            <div style={{ padding: '8px', border: '1px solid #e8e0d8', borderRadius: '8px', background: '#fff' }}>
              <QRCodeSVG value={qrData} size={90} fgColor="#6B2D0E" />
            </div>
          </div>

          {/* Footer */}
          <div style={{ background: '#f9f5f1', padding: '12px 24px', textAlign: 'center', borderTop: '1px dashed #ddd' }}>
            <p style={{ margin: 0, fontSize: '10px', color: '#999', fontFamily: 'sans-serif' }}>
              Presenta este ticket al llegar al restaurante
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '9px', color: '#bbb', fontFamily: 'sans-serif' }}>
              ID: {reservaId ? reservaId.slice(0, 8).toUpperCase() : 'PENDIENTE'}
            </p>
          </div>
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
      const res = await apiClient.post('/reservaciones', {
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
