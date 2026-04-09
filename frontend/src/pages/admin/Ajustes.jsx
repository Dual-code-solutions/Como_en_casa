import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings, User, Store, Bell, Shield, ChevronRight, Utensils
} from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import apiClient from '../../api/apiClient';
import { showAlert, showConfirm } from '../../utils/swalCustom';
import './AdminDashboard.css';
import './Ajustes.css';

const LOCAL_ID = "02ef18a9-62aa-4fcd-98ee-1134e4aaf197";

const Ajustes = () => {
  const navigate = useNavigate();
  const [notifSound, setNotifSound] = useState(true);
  const [notifNew, setNotifNew] = useState(true);
  const [autoAdvance, setAutoAdvance] = useState(false);
  
  const [localData, setLocalData] = useState({
    nombre: '',
    direccion: '',
    telefonoContacto: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── ESTADO MESAS ─────────────────────────────────────────
  const [mesas, setMesas] = useState([]);
  const [loadingMesas, setLoadingMesas] = useState(false);
  const [mesaModal, setMesaModal] = useState({ 
    isOpen: false, 
    isEdit: false, 
    data: { id: null, nombre_o_numero: '', capacidad: 2 } 
  });

  useEffect(() => {
    const fetchLocalYMesas = async () => {
      try {
        const [resLocal, resMesas] = await Promise.all([
          apiClient.get(`/locales/${LOCAL_ID}`),
          apiClient.get(`/locales/${LOCAL_ID}/mesas`)
        ]);
        
        if (resLocal.data?.data) {
          const l = resLocal.data.data;
          setLocalData({
            nombre: l.nombre || '',
            direccion: l.direccion || '',
            telefonoContacto: l.telefonoContacto || ''
          });
        }
        
        if (resMesas.data?.data) {
          setMesas(resMesas.data.data);
        }
      } catch (e) {
        console.error('Error fetching data Ajustes', e);
      }
      setLoading(false);
      setLoadingMesas(false);
    };
    fetchLocalYMesas();
  }, []);

  // ── MÉTODOS MESAS ────────────────────────────────────────
  const fetchMesas = async () => {
    try {
      const res = await apiClient.get(`/locales/${LOCAL_ID}/mesas`);
      setMesas(res.data?.data || []);
    } catch (e) { console.error(e); }
  };

  const openAddMesa = () => setMesaModal({ isOpen: true, isEdit: false, data: { id: null, nombre_o_numero: '', capacidad: 2 } });
  
  const openEditMesa = (m) => setMesaModal({ 
    isOpen: true, 
    isEdit: true, 
    data: { id: m.id, nombre_o_numero: m.nombreONumero || m.nombre_o_numero, capacidad: m.capacidad } 
  });

  const saveMesa = async () => {
    if (!mesaModal.data.nombre_o_numero) return showAlert('Atención', 'El nombre de la mesa es obligatorio', 'warning');
    try {
      if (mesaModal.isEdit) {
        await apiClient.patch(`/locales/${LOCAL_ID}/mesas/${mesaModal.data.id}`, {
          nombre_o_numero: mesaModal.data.nombre_o_numero,
          capacidad: mesaModal.data.capacidad
        });
      } else {
        await apiClient.post(`/locales/${LOCAL_ID}/mesas`, {
          nombre_o_numero: mesaModal.data.nombre_o_numero,
          capacidad: mesaModal.data.capacidad
        });
      }
      setMesaModal({ ...mesaModal, isOpen: false });
      fetchMesas();
    } catch (e) {
      showAlert('Error', 'Error guardando mesa: ' + (e.response?.data?.message || e.message), 'error');
    }
  };

  const deleteMesa = async (id) => {
    const isConf = await showConfirm(
      '¿Eliminar esta mesa?', 
      'Si tiene pedidos activos puede causar un error de integridad.', 
      'Sí, eliminar', 
      'warning'
    );
    if (!isConf) return;
    
    try {
      await apiClient.delete(`/locales/${LOCAL_ID}/mesas/${id}`);
      fetchMesas();
    } catch (e) {
      showAlert('Error', 'Error eliminando mesa: ' + (e.response?.data?.message || e.message), 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.patch(`/locales/${LOCAL_ID}`, localData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      showAlert('Error', 'Error guardando ajustes: ' + (err.response?.data?.message || err.message), 'error');
    }
    setSaving(false);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-info">
            <h1 className="dashboard-title">Ajustes</h1>
            <p className="dashboard-subtitle">Configura tu sucursal y preferencias del sistema.</p>
          </div>
        </header>

        <div className="ajustes-content">
          <form onSubmit={handleSave}>

            {/* Sucursal */}
            <div className="ajustes-card">
              <div className="ajustes-card-header">
                <Store size={20} />
                <h3>Información de la Sucursal</h3>
              </div>
              <div className="ajustes-field">
                <label>Nombre de la sucursal</label>
                <input
                  type="text"
                  value={localData.nombre}
                  onChange={e => setLocalData(p => ({ ...p, nombre: e.target.value }))}
                  placeholder="Ej: Sucursal Centro"
                  required
                />
              </div>
              <div className="ajustes-field">
                <label>Dirección</label>
                <input 
                  type="text" 
                  value={localData.direccion}
                  onChange={e => setLocalData(p => ({ ...p, direccion: e.target.value }))}
                  placeholder="Calle, número, colonia…" 
                />
              </div>
              <div className="ajustes-field">
                <label>Teléfono de contacto</label>
                <input 
                  type="tel" 
                  value={localData.telefonoContacto}
                  onChange={e => setLocalData(p => ({ ...p, telefonoContacto: e.target.value }))}
                  placeholder="999 000 0000" 
                />
              </div>
            </div>

            {/* Notificaciones */}
            <div className="ajustes-card">
              <div className="ajustes-card-header">
                <Bell size={20} />
                <h3>Notificaciones</h3>
              </div>
              <div className="ajustes-toggle-row">
                <div>
                  <p className="toggle-label">Sonido de alerta para nuevos pedidos</p>
                  <p className="toggle-desc">Reproduce un sonido cuando llega un pedido a "Entrantes".</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={notifSound} onChange={e => setNotifSound(e.target.checked)} />
                  <span className="toggle-knob" />
                </label>
              </div>
              <div className="ajustes-toggle-row">
                <div>
                  <p className="toggle-label">Notificación visual (badge en tab)</p>
                  <p className="toggle-desc">Muestra el número de pedidos pendientes en el título del navegador.</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={notifNew} onChange={e => setNotifNew(e.target.checked)} />
                  <span className="toggle-knob" />
                </label>
              </div>
            </div>

            <div className="ajustes-actions">
              {saved && <span className="saved-msg">✓ Cambios guardados</span>}
              <button type="submit" className="btn-save-ajustes" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>

          {/* Mesas (Fuera del form del local) */}
          <div className="ajustes-card" style={{ marginTop: '2rem' }}>
            <div className="ajustes-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Utensils size={20} />
                <h3>Administración de Mesas</h3>
              </div>
              <button type="button" className="btn-save-ajustes" onClick={openAddMesa} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                + Añadir Mesa
              </button>
            </div>
            
            {loadingMesas ? (
              <p>Cargando mesas...</p>
            ) : mesas.length === 0 ? (
              <p style={{ color: '#888', fontStyle: 'italic' }}>No hay mesas creadas.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                {mesas.map(m => (
                  <div key={m.id} style={{ border: '1px solid #EAD9C8', borderRadius: '10px', padding: '1rem', background: '#FFF8F2', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: '#5D3A1A' }}>{m.nombreONumero || m.nombre_o_numero}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#10b981', background: '#bbf7d0', padding: '2px 6px', borderRadius: '4px' }}>
                        {m.estado || 'disponible'}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#7B4A2A' }}>Capacidad: {m.capacidad} pax</p>
                    <div style={{ display: 'flex', gap: '5px', marginTop: 'auto', paddingTop: '0.5rem' }}>
                      <button onClick={() => openEditMesa(m)} style={{ flex: 1, padding: '0.3rem', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Editar</button>
                      <button onClick={() => deleteMesa(m.id)} style={{ padding: '0.3rem', background: '#fecaca', color: '#b91c1c', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Borrar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal de Mesas */}
        {mesaModal.isOpen && (
          <div className="modal-overlay-admin" onClick={() => setMesaModal({ ...mesaModal, isOpen: false })}>
            <div className="modal-content-admin" style={{ maxWidth: 350 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header-admin">
                <h2>{mesaModal.isEdit ? 'Editar Mesa' : 'Añadir Mesa'}</h2>
              </div>
              <div className="modal-body-admin">
                <div className="ajustes-field">
                  <label>Nombre o Número</label>
                  <input 
                    type="text" 
                    value={mesaModal.data.nombre_o_numero} 
                    onChange={e => setMesaModal(prev => ({ ...prev, data: { ...prev.data, nombre_o_numero: e.target.value } }))}
                    placeholder="Ej: Mesa 1, Terraza A" 
                  />
                </div>
                <div className="ajustes-field">
                  <label>Capacidad (personas)</label>
                  <input 
                    type="number" 
                    value={mesaModal.data.capacidad} 
                    onChange={e => setMesaModal(prev => ({ ...prev, data: { ...prev.data, capacidad: parseInt(e.target.value) || 2 } }))}
                    min="1" 
                  />
                </div>
              </div>
              <div className="modal-footer-admin">
                <button type="button" className="btn-secondary" onClick={() => setMesaModal({ ...mesaModal, isOpen: false })}>Cancelar</button>
                <button type="button" className="btn-primary" onClick={saveMesa}>Guardar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ajustes;
