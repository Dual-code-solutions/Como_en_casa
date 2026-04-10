import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Menu from './pages/client/Menu';
import CartSummary from './pages/client/CartSummary';
import Checkout from './pages/client/Checkout';
import ClientReservations from './pages/client/ClientReservations';
import OrderStatus from './pages/client/OrderStatus';
import LoginAdmin from './pages/admin/LoginAdmin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReservas from './pages/admin/AdminReservas';
import AdminMenu from './pages/admin/AdminMenu';
import Historial from './pages/admin/Historial';
import Ajustes from './pages/admin/Ajustes';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import AdminMesas from './pages/admin/AdminMesas';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Lado del Cliente */}
        <Route path="/" element={<Menu />} />
        <Route path="/cart" element={<CartSummary />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/status/:id" element={<OrderStatus />} />
        <Route path="/reservas" element={<ClientReservations />} />

        {/* Lado del Admin - Públicas */}
        <Route path="/admin/login" element={<LoginAdmin />} />

        {/* Lado del Admin - Blindadas */}
        <Route path="/admin/menu" element={
          <ProtectedRoute>
            <AdminMenu />
          </ProtectedRoute>
        } />
        <Route path="/admin/reservas" element={
          <ProtectedRoute>
            <AdminReservas />
          </ProtectedRoute>
        } />
        <Route path="/admin/mesas" element={
          <ProtectedRoute>
            <AdminMesas />
          </ProtectedRoute>
        } />
        <Route path="/admin/historial" element={
          <ProtectedRoute>
            <Historial />
          </ProtectedRoute>
        } />
        <Route path="/admin/usuarios" element={
          <ProtectedRoute>
            <AdminUsuarios />
          </ProtectedRoute>
        } />
        <Route path="/admin/ajustes" element={
          <ProtectedRoute>
            <Ajustes />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
