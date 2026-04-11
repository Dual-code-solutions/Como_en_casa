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
      email: u.email || '',
      rol: u.rol || 'admin',
      primerNombre: u.primerNombre || u.primer_nombre || '',
      segundoNombre: u.segundoNombre || u.segundo_nombre || '',
      primerApellido: u.primerApellido || u.primer_apellido || '',
      segundoApellido: u.segundoApellido || u.segundo_apellido || '',
      telefonoContacto: u.telefonoContacto || u.telefono_contacto || ''
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
    const estaActivo = user.estadoCuenta !== false;
    const accion = estaActivo ? 'deshabilitar' : 'activar';
    const nombre = user.primerNombre || user.primer_nombre || 'este usuario';
    const isConf = await showConfirm(
      `¿Cambiar estado?`,
      `¿Seguro que deseas ${accion} a ${nombre}?`,
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
              {users.map(u => {
                const nombre = `${u.primerNombre || u.primer_nombre || ''} ${u.primerApellido || u.primer_apellido || ''}`.trim() || 'Sin nombre';
                const email = u.email || 'Sin correo';
                const telefono = u.telefonoContacto || u.telefono_contacto || 'Sin Tel.';
                const activo = u.estadoCuenta !== false;
                return (
                <div key={u.id} className={`historial-row ${!activo ? 'row-cancelado' : ''}`}>
                  <div className="row-main" style={{ cursor: 'default' }}>
                    <div className="row-left">
                      <span className={`row-estado-badge ${u.rol === 'dueno' ? 'row-badge-finalizado' : 'row-badge-preparando'}`}>
                        {u.rol?.toUpperCase()}
                      </span>
                      <div className="row-info">
                        <p className="row-client">{nombre}</p>
                        <p className="row-meta">
                          {email} &nbsp;·&nbsp; {telefono}
                        </p>
                      </div>
                    </div>
                    <div className="row-right" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: activo ? '#10b981' : '#dc2626', marginRight: '1rem', fontWeight: 600 }}>
                        {activo ? 'Activo' : 'Inactivo'}
                      </span>
                      <button className="btn-icon edit" onClick={() => handleOpenEdit(u)} title="Editar Información">
                        <Edit2 size={16} />
                      </button>
                      <button className={`btn-icon ${activo ? 'delete' : 'edit'}`} onClick={() => handleToggleStatus(u)} title={activo ? "Deshabilitar acceso" : "Reactivar acceso"}>
                        {activo ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>

        {modalData.isOpen && (
          <div className="modal-overlay-admin" onClick={() => setModalData({ ...modalData, isOpen: false })}>
            <div className="modal-content-admin" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header-admin">
                <h2>{modalData.isEdit ? 'Editar Usuario' : 'Añadir Usuario'}</h2>
                <button className="btn-close" onClick={() => setModalData({ ...modalData, isOpen: false })}><X size={22} /></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body-admin" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

                  {/* ── Acceso ── */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8B4513', margin: 0 }}>Acceso al sistema</p>

                    <div className="form-group" style={{ margin: 0 }}>
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

                    <div style={{ display: 'grid', gridTemplateColumns: modalData.isEdit ? '1fr' : '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Correo Electrónico *</label>
                        <input
                          type="email" required
                          value={modalData.data.email}
                          onChange={e => setModalData(p => ({ ...p, data: { ...p.data, email: e.target.value } }))}
                          disabled={modalData.isEdit}
                          placeholder="correo@ejemplo.com"
                        />
                      </div>
                      {!modalData.isEdit && (
                        <div className="form-group" style={{ margin: 0 }}>
                          <label>Contraseña Temporal *</label>
                          <input
                            type="text" required
                            value={modalData.data.password}
                            onChange={e => setModalData(p => ({ ...p, data: { ...p.data, password: e.target.value } }))}
                            placeholder="Ej: Clave2024"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #f0e8df', margin: 0 }} />

                  {/* ── Datos personales ── */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8B4513', margin: 0 }}>Datos personales</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Primer Nombre *</label>
                        <input type="text" required value={modalData.data.primerNombre}
                          onChange={e => setModalData(p => ({ ...p, data: { ...p.data, primerNombre: e.target.value } }))}
                          placeholder="Ej: Juan"
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                          Segundo Nombre <em style={{ color: '#b0a097', fontStyle: 'normal', fontSize: '0.75rem' }}>Opcional</em>
                        </label>
                        <input type="text" value={modalData.data.segundoNombre}
                          onChange={e => setModalData(p => ({ ...p, data: { ...p.data, segundoNombre: e.target.value } }))}
                          placeholder="Ej: Carlos"
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Primer Apellido *</label>
                        <input type="text" required value={modalData.data.primerApellido}
                          onChange={e => setModalData(p => ({ ...p, data: { ...p.data, primerApellido: e.target.value } }))}
                          placeholder="Ej: García"
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                          Segundo Apellido <em style={{ color: '#b0a097', fontStyle: 'normal', fontSize: '0.75rem' }}>Opcional</em>
                        </label>
                        <input type="text" value={modalData.data.segundoApellido}
                          onChange={e => setModalData(p => ({ ...p, data: { ...p.data, segundoApellido: e.target.value } }))}
                          placeholder="Ej: López"
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                          Teléfono <em style={{ color: '#b0a097', fontStyle: 'normal', fontSize: '0.75rem' }}>Opcional</em>
                        </label>
                        <input type="tel" value={modalData.data.telefonoContacto}
                          onChange={e => setModalData(p => ({ ...p, data: { ...p.data, telefonoContacto: e.target.value } }))}
                          placeholder="Ej: 5512345678"
                        />
                      </div>
                    </div>
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

