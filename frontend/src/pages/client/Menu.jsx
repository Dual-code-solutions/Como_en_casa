import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabaseClient';
import CustomizationModal from '../../components/client/CustomizationModal';
import Navbar from '../../components/client/Navbar';
import { useCart } from '../../store/useCart';
import { Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import './Menu.css';

const LOCAL_ID = "02ef18a9-62aa-4fcd-98ee-1134e4aaf197";

const Menu = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const ribbonRef = useRef(null);

  const scrollRibbon = (direction) => {
    if (ribbonRef.current) {
      const scrollAmount = 250;
      ribbonRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchMenu = async () => {
      const { data: catData } = await supabase
        .from('categorias')
        .select('*')
        .eq('id_local', LOCAL_ID)
        .order('orden', { ascending: true });

      const { data: prodData } = await supabase
        .from('productos')
        .select('*, ingredientes_personalizables(*)')
        .eq('id_local', LOCAL_ID)
        .eq('visible_menu', true);

      if (catData) {
        setCategories(catData);
        setActiveCategory(catData[0]?.id || null);
      }
      if (prodData) setProducts(prodData);
    };
    fetchMenu();
  }, []);

  const filteredProducts = activeCategory
    ? products.filter(p => p.id_categoria === activeCategory)
    : products;

  const activeCategoryName = categories.find(c => c.id === activeCategory)?.nombre || 'Platillos';

  return (
    <div className="menu-page">
      <Navbar />

      {/* HEADER DE MADERA (Compacto) */}
      <header className="header-compact">
        <h1>Como en Casa</h1>
        <p>Sabor a tradición</p>
      </header>

      {/* LA REPISA DE CATEGORÍAS TIPO CARRUSEL */}
      <div className="category-ribbon">
        <div className="category-ribbon-wrapper">
          <button className="ribbon-arrow left" onClick={() => scrollRibbon('left')}><ChevronLeft size={20}/></button>
          
          <div className="category-ribbon-content" ref={ribbonRef}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.nombre}
              </button>
            ))}
          </div>

          <button className="ribbon-arrow right" onClick={() => scrollRibbon('right')}><ChevronRight size={20}/></button>
        </div>
      </div>

      {/* TÍTULO DE SECCIÓN */}
      <div className="menu-section-header">
        <h2 className="menu-section-title">{activeCategoryName}</h2>
        <div className="menu-section-divider"></div>
      </div>

      {/* GRID DE PRODUCTOS */}
      <main className="menu-main">
        <div className="product-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="card-pergamino" onClick={() => setSelectedProduct(product)}>
              <div className="product-image-container">
                <img
                  src={product.imagen_url || 'https://placehold.co/400x200/F5F5DC/8B4513?text=Platillo'}
                  alt={product.nombre}
                  className="product-image"
                />
                <div className="product-badge">Favorito</div>
              </div>
              <div className="product-info-box">
                <div className="product-info-top">
                  <div className="product-info-header">
                    <h3 className="product-name">{product.nombre}</h3>
                    <span className="product-price">${product.precio_base}</span>
                  </div>
                  <p className="product-desc">{product.descripcion}</p>
                </div>
                <button
                  className="btn-forja"
                  onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                >
                  <Settings size={18} className="spin-slow-icon" />
                  PERSONALIZAR PLATILLO
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL DE PERSONALIZACIÓN */}
      {selectedProduct && (
        <CustomizationModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onConfirm={(product, mods, modsReadable, subtotal) => {
            addToCart({ ...product, subtotal: parseFloat(subtotal) }, mods, modsReadable);
            setSelectedProduct(null);
            navigate('/cart');
          }}
        />
      )}

      {/* DOODLE DECORATIVO REAL (Espiga de trigo) */}
      <div className="doodle-deco">
         <img src="https://www.svgrepo.com/show/286131/wheat-grain.svg" alt="deco" />
      </div>
    </div>
  );
};

export default Menu;
