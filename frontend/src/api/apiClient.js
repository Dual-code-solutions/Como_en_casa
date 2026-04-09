import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request interceptor: adjunta el JWT en cada petición ──────────────────────
apiClient.interceptors.request.use((config) => {
  const sessionString = localStorage.getItem('admin_session');
  if (sessionString) {
    try {
      const session = JSON.parse(sessionString);
      if (session.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
      }
    } catch (e) {
      console.error('Error parseando admin_session', e);
    }
  }
  return config;
}, (error) => Promise.reject(error));

// ── Response interceptor: maneja 401 (sesión expirada) ───────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Sesión expirada o token inválido → limpiar y redirigir
      const wasLoggedIn = !!localStorage.getItem('admin_session');
      localStorage.removeItem('admin_session');
      if (wasLoggedIn && !window.location.pathname.includes('/login')) {
        // Pequeño toast antes de redirigir
        window.__sessionExpired = true;
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Función de logout (llama al backend + limpia local) ───────────────────────
export const logoutAdmin = async () => {
  try {
    await apiClient.post('/auth/logout');
  } catch (_) {
    // Silencioso — aunque falle el servidor limpiamos local
  } finally {
    localStorage.removeItem('admin_session');
    window.location.href = '/admin/login';
  }
};

// ── Función de verificación de sesión activa ──────────────────────────────────
export const checkSession = async () => {
  try {
    const res = await apiClient.get('/auth/me');
    return res.data?.data || null;
  } catch (_) {
    return null;
  }
};

export default apiClient;
