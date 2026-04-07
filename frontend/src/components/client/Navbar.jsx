import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../store/useCart';
import { ShoppingCart, Utensils, Calendar } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="navbar">
      <button className="navbar-brand-compact" onClick={() => navigate('/')}>
        <div className="brand-circle">CEC</div>
        <span className="brand-text">Sucursal Timucuy</span>
      </button>

      <div className="navbar-links">
        <button className="nav-link" onClick={() => navigate('/')}>
          <Utensils size={18} />
          Menú
        </button>
        <button className="nav-link" onClick={() => navigate('/reservas')}>
          <Calendar size={18} />
          Reservas
        </button>
        <button className="nav-cart-btn" onClick={() => navigate('/cart')}>
          <ShoppingCart size={18} />
          Mi Carrito
          {totalItems > 0 && (
            <span className="nav-cart-badge">{totalItems}</span>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
