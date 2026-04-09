import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { supabase } from '../../api/supabaseClient';
import {
  LayoutDashboard, Calendar as CalendarIcon, Settings, User,
  Plus, Edit2, Trash2, X, Utensils, Upload, ImageIcon, Minus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AdminMenu.css';
import './AdminDashboard.css';

const API = 'http://localhost:3000';
const LOCAL_ID = "02ef18a9-62aa-4fcd-98ee-1134e4aaf197";

const emptyForm = {
  nombre: '',
  descripcion: '',
  precio_base: '',
  id_categoria: '',
  visible_menu: true,
  // imagen: puede ser un File (para subir) o una URL de texto (legacy)
  imagenFile: null,
  imagenPreview: '',
  imagen_url_existente: ''
};

const AdminMenu = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [ingredientes, setIngredientes] = useState([]);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // ── Ingredientes dinámicos ──
  const agregarIngrediente = () => {
    setIngredientes(prev => [...prev, { nombre: '', precio_extra: 0, es_base: true, permite_doble: true }]);
  };

  const actualizarIngrediente = (index, campo, valor) => {
    setIngredientes(prev => {
      const copia = [...prev];
      copia[index] = { ...copia[index], [campo]: valor };
      return copia;
    });
  };

  const eliminarIngrediente = (index) => {
    setIngredientes(prev => prev.filter((_, i) => i !== index));
  };

  // ──────────────────────────────
  // FETCH DATA
  // ──────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    const { data: catData } = await supabase
      .from('categorias')
      .select('*')
      .eq('id_local', LOCAL_ID)
      .order('orden', { ascending: true });

    const { data: prodData } = await supabase
      .from('productos')
      .select('*')
      .eq('id_local', LOCAL_ID)
      .order('creado_at', { ascending: false });

    if (catData) setCategories(catData);
    if (prodData) setProducts(prodData);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.id_categoria === activeCategory);

  // ──────────────────────────────
  // MODAL
  // ──────────────────────────────
  const openNew = () => {
    setEditingProduct(null);
    setFormData({ ...emptyForm, id_categoria: categories[0]?.id || '' });
    setIngredientes([]);
    setIsModalOpen(true);
  };

  const openEdit = async (product) => {
    setEditingProduct(product);
    setFormData({
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio_base: product.precio_base,
      id_categoria: product.id_categoria,
      visible_menu: product.visible_menu,
      imagenFile: null,
      imagenPreview: product.imagen_url || '',
      imagen_url_existente: product.imagen_url || ''
    });

    // Cargar ingredientes existentes del producto
    const { data: ingsData } = await supabase
      .from('ingredientes_personalizables')
      .select('*')
      .eq('id_producto', product.id);
    setIngredientes(ingsData || []);

    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setSaving(false); };

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData(prev => ({
      ...prev,
      imagenFile: file,
      imagenPreview: URL.createObjectURL(file)
    }));
  };

  // ──────────────────────────────
  // GUARDAR (CREAR / EDITAR)
  // ──────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = new FormData();
      data.append('id_local', LOCAL_ID);
      data.append('id_categoria', formData.id_categoria);
      data.append('nombre', formData.nombre);
      data.append('descripcion', formData.descripcion);
      data.append('precio_base', formData.precio_base);
      data.append('visible_menu', formData.visible_menu);
      data.append('ingredientes', JSON.stringify(ingredientes));

      if (formData.imagenFile) {
        // El admin subió un archivo nuevo
        data.append('imagen_url', formData.imagenFile);
      } else if (editingProduct) {
        // Editar sin cambiar la imagen → pasar la URL actual
        data.append('imagen_url_existente', formData.imagen_url_existente);
      }

      if (editingProduct) {
        await axios.put(`${API}/api/products/${editingProduct.id}/update`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post(`${API}/api/products/create`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      await fetchData();
      closeModal();
    } catch (err) {
      console.error('Error al guardar:', err.response?.data || err.message);
      alert('Error: ' + (err.response?.data?.error || err.message));
      setSaving(false);
    }
  };

  // ──────────────────────────────
  // TOGGLE VISIBILIDAD
  // ──────────────────────────────
  const handleToggleVisibility = async (product) => {
    const newVal = !product.visible_menu;
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, visible_menu: newVal } : p));
    try {
      await axios.patch(`${API}/api/products/${product.id}/visibility`, { visible_menu: newVal });
    } catch (err) {
      console.error('Error al cambiar visibilidad:', err.message);
      // Revertir en caso de error
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, visible_menu: !newVal } : p));
    }
  };

  // ──────────────────────────────
  // BORRADO LÓGICO
  // ──────────────────────────────
  const handleDelete = async (product) => {
    if (!window.confirm(`¿Eliminar "${product.nombre}" del menú? El registro quedará oculto pero no se perderán pedidos históricos.`)) return;
    setProducts(prev => prev.filter(p => p.id !== product.id));
    try {
      await axios.delete(`${API}/api/products/${product.id}`);
    } catch (err) {
      console.error('Error al eliminar:', err.message);
      await fetchData(); // recargar si falló
    }
  };

  // ──────────────────────────────
  // RENDER
  // ──────────────────────────────
  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <img src="/src/assets/logo.png" alt="Como en Casa" className="sidebar-logo" />
          <h2 className="sidebar-brand-name">Como en Casa</h2>
        </div>
        <nav className="sidebar-nav">
          <button className="sidebar-nav-item" onClick={() => navigate('/admin')}>
            <LayoutDashboard size={20} /> Panel Recepción
          </button>
          <button className="sidebar-nav-item" onClick={() => navigate('/admin/reservas')}>
            <CalendarIcon size={20} /> Reservaciones
          </button>
          <button className="sidebar-nav-item active">
            <Utensils size={20} /> Gestión de Menú
          </button>
          <button className="sidebar-nav-item">
            <Settings size={20} /> Ajustes (Pronto)
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="user-profile">
            <User size={32} className="user-avatar" />
            <div className="user-info">
              <span className="user-name">Admin Timucuy</span>
              <span className="status-badge-sidebar">En Línea</span>
            </div>
          </div>
        </div>
      </aside>

      {/* CONTENIDO */}
      <div className="menu-dashboard-main">
        <header className="dashboard-header">
          <div className="header-info">
            <h1 className="dashboard-title">Gestión de Menú</h1>
            <p className="dashboard-subtitle">Añade, edita u oculta los platillos del catálogo.</p>
          </div>
          <div className="header-actions-menu">
            <button className="btn-new-product" onClick={openNew}>
              <Plus size={20} /> Nuevo Platillo
            </button>
          </div>
        </header>

        <main className="menu-board">
          {/* Filtro de categorías */}
          <div className="admin-category-filter">
            <button className={`admin-cat-btn ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`admin-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.nombre}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-state">Cargando inventario...</div>
          ) : (
            <div className="admin-products-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className={`admin-product-card ${!product.visible_menu ? 'hidden-product' : ''}`}>
                  <div className="product-img-container">
                    <span className={`badge-status ${product.visible_menu ? 'badge-visible' : 'badge-hidden'}`}>
                      {product.visible_menu ? 'Visible' : 'Oculto'}
                    </span>
                    <img
                      src={product.imagen_url || 'https://placehold.co/400x200/F5F5DC/8B4513?text=Sin+Imagen'}
                      alt={product.nombre}
                    />
                  </div>
                  <div className="product-info">
                    <div className="product-info-head">
                      <h3>{product.nombre}</h3>
                      <span className="product-price">${product.precio_base}</span>
                    </div>
                    <p>{product.descripcion}</p>
                  </div>
                  <div className="product-actions">
                    <label className="visibility-toggle">
                      <input
                        type="checkbox"
                        checked={product.visible_menu}
                        onChange={() => handleToggleVisibility(product)}
                      />
                      {product.visible_menu ? 'Visible en menú' : 'Oculto'}
                    </label>
                    <div className="action-btns">
                      <button className="btn-icon edit" title="Editar" onClick={() => openEdit(product)}>
                        <Edit2 size={18} />
                      </button>
                      <button className="btn-icon delete" title="Eliminar" onClick={() => handleDelete(product)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <p>No hay productos en esta categoría.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-overlay-admin">
          <div className="modal-content-admin">
            <div className="modal-header-admin">
              <h2>{editingProduct ? 'Editar Platillo' : 'Nuevo Platillo'}</h2>
              <button className="btn-close" onClick={closeModal}><X size={24} /></button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body-admin">

                {/* Zona de imagen */}
                <div className="form-group">
                  <label>Foto del Platillo</label>
                  <div
                    className="image-upload-zone"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {formData.imagenPreview ? (
                      <img src={formData.imagenPreview} alt="preview" className="image-preview" />
                    ) : (
                      <div className="image-placeholder">
                        <ImageIcon size={32} className="placeholder-icon" />
                        <span>Haz clic para seleccionar una foto</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  {formData.imagenPreview && (
                    <button
                      type="button"
                      className="btn-change-image"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={14} /> Cambiar imagen
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label>Nombre del Platillo *</label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleInput} required placeholder="Ej: Enchiladas Suizas" />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Precio Base ($) *</label>
                    <input type="number" step="0.01" min="0" name="precio_base" value={formData.precio_base} onChange={handleInput} required placeholder="120.50" />
                  </div>
                  <div className="form-group">
                    <label>Categoría *</label>
                    <select name="id_categoria" value={formData.id_categoria} onChange={handleInput} required>
                      <option value="" disabled>Selecciona...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Descripción *</label>
                  <textarea name="descripcion" value={formData.descripcion} onChange={handleInput} required placeholder="Breve descripción de ingredientes y preparación..." />
                </div>

                {/* ── INGREDIENTES PERSONALIZABLES ── */}
                <div className="ingredientes-section">
                  <div className="ingredientes-header">
                    <h3 className="ingredientes-title">Ingredientes Personalizables</h3>
                    <button type="button" className="btn-add-ing" onClick={agregarIngrediente}>
                      <Plus size={14} /> Añadir Ingrediente
                    </button>
                  </div>

                  {ingredientes.length === 0 ? (
                    <p className="ingredientes-empty">Sin ingredientes. El cliente no podrá personalizar este platillo.</p>
                  ) : (
                    <div className="ingredientes-list">
                      {ingredientes.map((ing, index) => (
                        <div key={index} className="ingrediente-row">
                          <button
                            type="button"
                            className="btn-remove-ing"
                            onClick={() => eliminarIngrediente(index)}
                            title="Quitar"
                          >
                            <Minus size={12} />
                          </button>

                          <div className="ing-fields">
                            <div className="ing-top">
                              <div className="form-group" style={{ margin: 0, flex: 2 }}>
                                <label>Nombre</label>
                                <input
                                  type="text"
                                  placeholder="Ej: Queso Extra"
                                  value={ing.nombre}
                                  onChange={e => actualizarIngrediente(index, 'nombre', e.target.value)}
                                  required
                                />
                              </div>
                              <div className="form-group" style={{ margin: 0, flex: 1 }}>
                                <label>Precio Extra ($)</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.50"
                                  value={ing.precio_extra}
                                  onChange={e => actualizarIngrediente(index, 'precio_extra', e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="ing-checks">
                              <label>
                                <input
                                  type="checkbox"
                                  checked={ing.es_base}
                                  onChange={e => actualizarIngrediente(index, 'es_base', e.target.checked)}
                                />
                                Ya viene incluido
                              </label>
                              <label>
                                <input
                                  type="checkbox"
                                  checked={ing.permite_doble}
                                  onChange={e => actualizarIngrediente(index, 'permite_doble', e.target.checked)}
                                />
                                Permite porción doble
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group checkbox-group">
                  <input type="checkbox" id="visible_check" name="visible_menu" checked={formData.visible_menu} onChange={handleInput} />
                  <label htmlFor="visible_check" style={{ margin: 0 }}>
                    Mostrar en el menú público inmediatamente
                  </label>
                </div>
              </div>

              <div className="modal-footer-admin">
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : (editingProduct ? 'Guardar Cambios' : 'Añadir Platillo')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenu;
