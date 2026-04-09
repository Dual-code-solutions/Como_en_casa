import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, UserX, UserCheck, X } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import apiClient from '../../api/apiClient';
import { showAlert, showConfirm } from '../../utils/swalCustom';
import './AdminDashboard.css';

const LOCAL_ID = "02ef18a9-62aa-4fcd-98ee-1134e4aaf197";

const emptyUser = {
  email: '',
  password: '',
  rol: 'admin',
  primerNombre: '',
  segundoNombre: '',
  primerApellido: '',
  segundoApellido: '',
  telefonoContacto: ''
};

const AdminUsuarios = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState({ isOpen: false, isEdit: false, data: emptyUser });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/users?id_local=${LOCAL_ID}`);
      setUsers(res.data?.data || []);
    } catch (e) {
      console.error(e);
      showAlert('Error', 'Error al cargar usuarios. Asegúrate de tener permisos (Dueño).', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAdd = () => setModalData({ isOpen: true, isEdit: false, data: { ...emptyUser } });
  const handleOpenEdit = (u) => setModalData({ 
    isOpen: true, 
    isEdit: true, 
    data: {
      id: u.id,
      email: u.auth_email || '',
      rol: u.rol || 'admin',
      primerNombre: u.primer_nombre || '',
      segundoNombre: u.segundo_nombre || '',
      primerApellido: u.primer_apellido || '',
      segundoApellido: u.segundo_apellido || '',
      telefonoContacto: u.telefono_contacto || ''
    } 
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...modalData.data, localId: LOCAL_ID };
      if (modalData.isEdit) {
        await apiClient.patch(`/users/${modalData.data.id}`, payload);
      } else {
        await apiClient.post('/users', payload);
      }
      setModalData({ ...modalData, isOpen: false });
      fetchUsers();
    } catch (e) {
      showAlert('Error', 'Error guardando usuario: ' + (e.response?.data?.message || e.message), 'error');
    }
    setSaving(false);
  };

  const handleToggleStatus = async (user) => {
    const accion = user.estado === 'activo' ? 'deshabilitar' : 'activar';
    const isConf = await showConfirm(
      `¿Cambiar estado?`,
      `¿Seguro que deseas ${accion} al usuario ${user.primer_nombre}?`,
      'Sí, aplicar',
      'warning'
    );
    if (!isConf) return;
    
    try {
      await apiClient.patch(`/users/${user.id}/toggle-status`);
      fetchUsers();
    } catch (e) {
      showAlert('Error', 'Error cambiando estado: ' + (e.response?.data?.message || e.message), 'error');
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-info">
            <h1 className="dashboard-title">Gestión de Usuarios</h1>
            <p className="dashboard-subtitle">Administra los accesos y roles del equipo (Sólo Dueño).</p>
          </div>
          <button className="btn-new-product" onClick={handleOpenAdd}>
            <Plus size={16} /> Nuevo Usuario
          </button>
        </header>

        <div className="historial-content" style={{ marginTop: '1rem' }}>
          {loading ? (
            <p className="loading-state">Cargando usuarios...</p>
          ) : users.length === 0 ? (
            <div className="historial-empty">
              <Shield size={50} color="#ccc" />
              <p>No se encontraron sub-usuarios en esta sucursal.</p>
            </div>
          ) : (
            <div className="historial-list">
              {users.map(u => (
                <div key={u.id} className={`historial-row ${u.estado === 'inactivo' ? 'row-cancelado' : ''}`}>
                  <div className="row-main" style={{ cursor: 'default' }}>
                    <div className="row-left">
                      <span className={`row-estado-badge ${u.rol === 'dueno' ? 'row-badge-finalizado' : 'row-badge-preparando'}`}>
                        {u.rol?.toUpperCase()}
                      </span>
                      <div className="row-info">
                        <p className="row-client">{u.primer_nombre} {u.primer_apellido}</p>
                        <p className="row-meta">
                          {u.auth_email} &nbsp;·&nbsp; {u.telefono_contacto || 'Sin Tel.'}
                        </p>
                      </div>
                    </div>
                    <div className="row-right" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: u.estado === 'activo' ? '#10b981' : '#dc2626', marginRight: '1rem', fontWeight: 600 }}>
                        {u.estado}
                      </span>
                      <button className="btn-icon edit" onClick={() => handleOpenEdit(u)} title="Editar Información">
                        <Edit2 size={16} />
                      </button>
                      <button className={`btn-icon ${u.estado === 'activo' ? 'delete' : 'edit'}`} onClick={() => handleToggleStatus(u)} title={u.estado === 'activo' ? "Deshabilitar acceso" : "Reactivar acceso"}>
                        {u.estado === 'activo' ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {modalData.isOpen && (
          <div className="modal-overlay-admin" onClick={() => setModalData({ ...modalData, isOpen: false })}>
            <div className="modal-content-admin" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header-admin">
                <h2>{modalData.isEdit ? 'Editar Usuario' : 'Añadir Usuario'}</h2>
                <button className="btn-close" onClick={() => setModalData({ ...modalData, isOpen: false })}><X size={22} /></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body-admin" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Rol de Usuario *</label>
                    <select 
                      value={modalData.data.rol} 
                      onChange={e => setModalData(p => ({ ...p, data: { ...p.data, rol: e.target.value } }))}
                      className="ajustes-field input"
                    >
                      <option value="admin">Administrador (Cajero)</option>
                      <option value="dueno">Dueño (Sistema Gral)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Correo Electrónico *</label>
                    <input 
                      type="email" 
                      required 
                      value={modalData.data.email} 
                      onChange={e => setModalData(p => ({ ...p, data: { ...p.data, email: e.target.value } }))}
                      disabled={modalData.isEdit}
                    />
                  </div>
                  {!modalData.isEdit && (
                    <div className="form-group">
                      <label>Contraseña Temporal *</label>
                      <input 
                        type="text" 
                        required 
                        value={modalData.data.password} 
                        onChange={e => setModalData(p => ({ ...p, data: { ...p.data, password: e.target.value } }))}
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label>Primer Nombre *</label>
                    <input type="text" required value={modalData.data.primerNombre} onChange={e => setModalData(p => ({ ...p, data: { ...p.data, primerNombre: e.target.value } }))} />
                  </div>
                  <div className="form-group">
                    <label>Primer Apellido *</label>
                    <input type="text" required value={modalData.data.primerApellido} onChange={e => setModalData(p => ({ ...p, data: { ...p.data, primerApellido: e.target.value } }))} />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Teléfono (Opcional)</label>
                    <input type="tel" value={modalData.data.telefonoContacto} onChange={e => setModalData(p => ({ ...p, data: { ...p.data, telefonoContacto: e.target.value } }))} />
                  </div>
                </div>
                <div className="modal-footer-admin">
                  <button type="button" className="btn-secondary" onClick={() => setModalData({ ...modalData, isOpen: false })}>Cancelar</button>
                  <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsuarios;
