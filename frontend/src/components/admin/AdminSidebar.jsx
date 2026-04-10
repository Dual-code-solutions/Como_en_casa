// src/components/admin/AdminSidebar.jsx
// Sidebar compartido para todos los módulos admin
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Calendar as CalendarIcon, Settings, User,
  Utensils, ClipboardList, LogOut, AlertCircle
} from 'lucide-react';
import { logoutAdmin, checkSession } from '../../api/apiClient';

const NAV_ITEMS = [
  { path: '/admin',           label: 'Panel Recepción', Icon: LayoutDashboard },
  { path: '/admin/reservas',  label: 'Reservaciones',   Icon: CalendarIcon },
  { path: '/admin/mesas',     label: 'Mesas',           Icon: Utensils },
  { path: '/admin/menu',      label: 'Gestión de Menú', Icon: Utensils },
  { path: '/admin/historial', label: 'Historial',       Icon: ClipboardList },
  { path: '/admin/usuarios',  label: 'Usuarios',        Icon: User },
  { path: '/admin/ajustes',   label: 'Ajustes',         Icon: Settings },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [user, setUser] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    // Mostrar aviso si venimos de un 401
    if (window.__sessionExpired) {
      setSessionExpired(true);
      window.__sessionExpired = false;
    }

    // Cargar datos del admin desde /auth/me
    checkSession().then(data => {
      if (data) setUser(data);
    });
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutAdmin(); // redirige automáticamente
  };

  // Determina qué item está activo exactamente
  const isActive = (path) => {
    if (path === '/admin') return pathname === '/admin';
    return pathname.startsWith(path);
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <img src="/src/assets/logo.png" alt="Como en Casa" className="sidebar-logo" />
        <h2 className="sidebar-brand-name">Como en Casa</h2>
      </div>

      {sessionExpired && (
        <div className="sidebar-session-alert">
          <AlertCircle size={14} />
          Sesión anterior expiró
        </div>
      )}

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ path, label, Icon }) => (
          <button
            key={path}
            className={`sidebar-nav-item ${isActive(path) ? 'active' : ''}`}
            onClick={() => navigate(path)}
          >
            <Icon size={20} /> {label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <User size={32} className="user-avatar" />
          <div className="user-info">
            <span className="user-name">{user?.nombre || 'Admin'}</span>
            <span className="status-badge-sidebar">En Línea</span>
          </div>
        </div>
        <button
          className="btn-logout"
          onClick={handleLogout}
          disabled={loggingOut}
          title="Cerrar sesión"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
