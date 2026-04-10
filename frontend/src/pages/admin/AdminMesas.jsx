import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { Plus, Edit2, Trash2, Users, MapPin, Search } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { showAlert, showConfirm } from '../../utils/swalCustom';
import Swal from 'sweetalert2';
import './AdminMesas.css';
import './AdminDashboard.css';

const LOCAL_ID = '02ef18a9-62aa-4fcd-98ee-1134e4aaf197';

const AdminMesas = () => {
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMesas = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/locales/${LOCAL_ID}/mesas`);
      setMesas(res.data?.data || []);
    } catch (error) {
      console.error(error);
      showAlert('Error', 'No se pudieron cargar las mesas.', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMesas();
  }, []);

  const parseNombreODescripcion = (nombreONumero) => {
    if (!nombreONumero) return { nombre: '', descripcion: '' };
    const parts = nombreONumero.split(' - ');
    if (parts.length > 1) {
      const nombre = parts[0];
      const descripcion = parts.slice(1).join(' - ');
      return { nombre, descripcion };
    }
    return { nombre: nombreONumero, descripcion: '' };
  };

  const handleAddMesa = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Añadir Nueva Mesa',
      html: `
        <div style="text-align: left;">
          <div class="mesa-form-group">
            <label>Nombre o Número *</label>
            <input id="swal-input-nombre" class="swal2-input mesa-input" style="margin: 0;" placeholder="Ej: Mesa 1" required>
          </div>
          <div class="mesa-form-group">
            <label>Ubicación / Descripción</label>
            <input id="swal-input-desc" class="swal2-input mesa-input" style="margin: 0;" placeholder="Ej: Terraza Frontal">
          </div>
          <div class="mesa-form-group">
            <label>Capacidad (personas) *</label>
            <input id="swal-input-cap" type="number" class="swal2-input mesa-input" style="margin: 0;" value="4" min="1" required>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar Mesa',
      cancelButtonText: 'Cancelar',
      buttonsStyling: false,
      customClass: {
        popup: 'swal-custom-popup',
        confirmButton: 'btn-primary',
        cancelButton: 'btn-secondary'
      },
      preConfirm: () => {
        const nombre = document.getElementById('swal-input-nombre').value.trim();
        const desc = document.getElementById('swal-input-desc').value.trim();
        const capacidad = document.getElementById('swal-input-cap').value;

        if (!nombre || !capacidad) {
          Swal.showValidationMessage('El nombre y capacidad son obligatorios');
          return false;
        }

        return {
          nombre_o_numero: desc ? `${nombre} - ${desc}` : nombre,
          capacidad: parseInt(capacidad, 10),
          estadoActual: 'disponible'
        };
      }
    });

    if (formValues) {
      try {
        await apiClient.post(`/locales/${LOCAL_ID}/mesas`, formValues);
        showAlert('Éxito', 'Mesa agregada correctamente.', 'success');
        fetchMesas();
      } catch (e) {
        showAlert('Error', e.response?.data?.message || 'Error al guardar.', 'error');
      }
    }
  };

  const handleEditMesa = async (mesa) => {
    const parsed = parseNombreODescripcion(mesa.nombre_o_numero || mesa.nombreONumero);
    const { value: formValues } = await Swal.fire({
      title: 'Editar Mesa',
      html: `
        <div style="text-align: left;">
          <div class="mesa-form-group">
            <label>Nombre o Número *</label>
            <input id="swal-input-nombre" class="swal2-input mesa-input" style="margin: 0;" value="${parsed.nombre}" required>
          </div>
          <div class="mesa-form-group">
            <label>Ubicación / Descripción</label>
            <input id="swal-input-desc" class="swal2-input mesa-input" style="margin: 0;" value="${parsed.descripcion}">
          </div>
          <div class="mesa-form-group">
            <label>Capacidad (personas) *</label>
            <input id="swal-input-cap" type="number" class="swal2-input mesa-input" style="margin: 0;" value="${mesa.capacidad}" min="1" required>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Actualizar Mesa',
      cancelButtonText: 'Cancelar',
      buttonsStyling: false,
      customClass: {
        popup: 'swal-custom-popup',
        confirmButton: 'btn-primary',
        cancelButton: 'btn-secondary'
      },
      preConfirm: () => {
        const nombre = document.getElementById('swal-input-nombre').value.trim();
        const desc = document.getElementById('swal-input-desc').value.trim();
        const capacidad = document.getElementById('swal-input-cap').value;

        if (!nombre || !capacidad) {
          Swal.showValidationMessage('El nombre y capacidad son obligatorios');
          return false;
        }

        return {
          nombre_o_numero: desc ? `${nombre} - ${desc}` : nombre,
          capacidad: parseInt(capacidad, 10)
        };
      }
    });

    if (formValues) {
      try {
        await apiClient.patch(`/locales/${LOCAL_ID}/mesas/${mesa.id}`, formValues);
        showAlert('Éxito', 'Mesa actualizada correctamente.', 'success');
        fetchMesas();
      } catch (e) {
        showAlert('Error', e.response?.data?.message || 'Error al actualizar.', 'error');
      }
    }
  };

  const handleDeleteMesa = async (id, nombreItem) => {
    const ok = await showConfirm(
      '¿Eliminar mesa?',
      `Se eliminará "${nombreItem}". Esta acción no se puede deshacer.`,
      'Sí, eliminar',
      'warning'
    );
    if (!ok) return;

    try {
      await apiClient.delete(`/locales/${LOCAL_ID}/mesas/${id}`);
      fetchMesas();
    } catch (e) {
      const msg = e.response?.data?.message || 'Error al eliminar.';
      showAlert('Atención', msg, 'error');
    }
  };

  const handleToggleEstado = async (mesa) => {
    const nuevoEstado = mesa.estado_actual === 'ocupada' ? 'disponible' : 'ocupada';
    try {
      await apiClient.patch(`/locales/${LOCAL_ID}/mesas/${mesa.id}/estado`, { estado_actual: nuevoEstado });
      fetchMesas();
    } catch (e) {
      showAlert('Error', 'No se pudo actualizar el estado.', 'error');
    }
  };

  const filteredMesas = mesas.filter(m => {
    const text = (m.nombre_o_numero || m.nombreONumero || '').toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-info">
            <h1 className="dashboard-title">Gestión de Mesas</h1>
            <p className="dashboard-subtitle">Monitorización y administración del piso</p>
          </div>
          <div className="dashboard-actions pt-2" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', top: '10px', left: '10px', color: '#999' }} />
              <input
                type="text"
                placeholder="Buscar mesa..."
                className="input-standalone"
                style={{ paddingLeft: '32px', height: '36px', minWidth: '200px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-add-mesa" onClick={handleAddMesa}>
              <Plus size={18} /> Añadir Mesa
            </button>
          </div>
        </header>

        <main className="admin-mesas-container pt-4">
          {loading ? (
            <div className="loading-state">Cargando mesas...</div>
          ) : filteredMesas.length === 0 ? (
            <div className="historial-empty">
              <MapPin size={48} color="#ccc" />
              <p>No hay mesas registradas o coincidentes con la búsqueda.</p>
            </div>
          ) : (
            <div className="mesas-grid">
              {filteredMesas.map(mesa => {
                const parsed = parseNombreODescripcion(mesa.nombre_o_numero || mesa.nombreONumero);
                const isOcupada = mesa.estado_actual === 'ocupada';

                return (
                  <div key={mesa.id} className={`mesa-card estado-${mesa.estado_actual}`}>
                    <div className="mesa-header">
                      <div className="mesa-title-wrapper">
                        <MapPin className="mesa-icon" size={20} />
                        <div className="mesa-info">
                          <h3>{parsed.nombre}</h3>
                          {parsed.descripcion && <span className="mesa-desc">{parsed.descripcion}</span>}
                        </div>
                      </div>
                      <span className={`mesa-state-pill ${mesa.estado_actual}`}>
                        {isOcupada ? 'Ocupada' : 'Disponible'}
                      </span>
                    </div>

                    <div className="mesa-body">
                      <div className="mesa-stat">
                        <Users size={16} /> 
                        <span>Capacidad: <strong>{mesa.capacidad} personas</strong></span>
                      </div>
                    </div>

                    <div className="mesa-actions">
                      <button 
                        className="btn-toggle-state" 
                        onClick={() => handleToggleEstado(mesa)}
                      >
                        Marcar como {isOcupada ? 'Disponible' : 'Ocupada'}
                      </button>
                      <div className="action-icon-group">
                        <button className="btn-icon-mesa edit" title="Editar mesa" onClick={() => handleEditMesa(mesa)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-icon-mesa delete" title="Eliminar mesa" onClick={() => handleDeleteMesa(mesa.id, parsed.nombre)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminMesas;
