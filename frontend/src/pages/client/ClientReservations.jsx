import React, { useState } from 'react';
import { supabase } from '../../api/supabaseClient';
import { Calendar, Clock, Users, Phone, User as UserIcon, MessageSquare, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/client/Navbar';
import './ClientReservations.css';

const ClientReservations = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Formulario, 2: Confirmación
  const [loading, setLoading] = useState(false);
  const localId = "02ef18a9-62aa-4fcd-98ee-1134e4aaf197"; // Timucuy

  const [formData, setFormData] = useState({
    nombre_cliente: '',
    telefono: '',
    fecha_reserva: '',
    hora_reserva: '',
    num_personas: 2,
    notas_adicionales: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('reservaciones')
      .insert([{ 
        ...formData, 
        id_local: localId,
        estado: 'pendiente' 
      }]);

    if (!error) {
      setStep(2);
      // Aquí dispararíamos el socket para avisar al admin (próximo paso)
    } else {
      alert("Hubo un error al guardar tu reserva. Inténtalo de nuevo.");
    }
    setLoading(false);
  };

  if (step === 2) {
    return (
      <div className="client-res-page">
        <Navbar />
        <div className="client-res-confirm-container">
          <div className="client-res-confirm-card">
            <div className="confirm-icon-wrapper">
              <CheckCircle className="confirm-icon" size={40} />
            </div>
            <h2 className="confirm-title">¡Reserva Recibida!</h2>
            <p className="confirm-text">
              Hemos registrado tu solicitud, <strong>{formData.nombre_cliente}</strong>. 
              Recuerda que para confirmar tu mesa se requiere un anticipo de <strong>$250.00</strong>. 
              Nos comunicaremos contigo al teléfono proporcionado.
            </p>
            <button onClick={() => navigate('/')} className="btn-back-menu">
              Volver al Menú
            </button>
          </div>
        </div>
      </div>
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
                  onChange={(e) => setFormData({...formData, fecha_reserva: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Clock size={16} /> ¿A qué hora?
                </label>
                <input required type="time" 
                  className="form-input"
                  onChange={(e) => setFormData({...formData, hora_reserva: e.target.value})} />
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
