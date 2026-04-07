import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Menu from './pages/client/Menu';
import CartSummary from './pages/client/CartSummary';
import Checkout from './pages/client/Checkout';
import ClientReservations from './pages/client/ClientReservations';
import LoginAdmin from './pages/admin/LoginAdmin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReservas from './pages/admin/AdminReservas';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Lado del Cliente */}
        <Route path="/" element={<Menu />} />
        <Route path="/cart" element={<CartSummary />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/reservas" element={<ClientReservations />} />

        {/* Lado del Admin - Públicas */}
        <Route path="/admin/login" element={<LoginAdmin />} />

        {/* Lado del Admin - Blindadas */}
        <Route path="/admin/reservas" element={
          <ProtectedRoute>
            <AdminReservas />
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
