import React, { useEffect, useState, useRef } from 'react';
import apiClient from '../../api/apiClient';
import { Plus, Edit2, Trash2, X, Upload, ImageIcon, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { showAlert, showConfirm } from '../../utils/swalCustom';
import './AdminMenu.css';
import './AdminDashboard.css';

const LOCAL_ID = "02ef18a9-62aa-4fcd-98ee-1134e4aaf197";

const emptyForm = {
  nombre: '',
  descripcion: '',
  precio_base: '',
  id_categoria: '',
  visible_menu: true,
  disponible: true,
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

  // ── Estado para CRUD de Categorías (#20, #21, #22) ──────────────────────────
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catForm, setCatForm] = useState({ nombre: '', descripcion: '' });
  const [editingCat, setEditingCat] = useState(null); // null = crear, objeto = editar
  const [savingCat, setSavingCat] = useState(false);

  const openNewCat = () => { setEditingCat(null); setCatForm({ nombre: '', descripcion: '' }); setCatModalOpen(true); };
  const openEditCat = (cat) => { setEditingCat(cat); setCatForm({ nombre: cat.nombre, descripcion: cat.descripcion || '' }); setCatModalOpen(true); };

  const handleSaveCat = async (e) => {
    e.preventDefault();
    if (!catForm.nombre.trim()) return;
    setSavingCat(true);
    try {
      if (editingCat) {
        // #21 PATCH /categorias/:id
        await apiClient.patch(`/locales/${LOCAL_ID}/categorias/${editingCat.id}`, catForm);
      } else {
        // #20 POST /categorias
        await apiClient.post(`/locales/${LOCAL_ID}/categorias`, catForm);
      }
      await fetchData();
      setCatModalOpen(false);
    } catch (err) {
      showAlert('Error', 'Error guardando categoría: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCat = async (cat) => {
    const isConf = await showConfirm(
      '¿Eliminar categoría?',
      `¿Eliminar la categoría "${cat.nombre}"? Los productos quedarán sin categoría.`,
      'Sí, eliminar',
      'warning'
    );
    if (!isConf) return;
    try {
      // #22 DELETE /categorias/:id
      await apiClient.delete(`/locales/${LOCAL_ID}/categorias/${cat.id}`);
      setActiveCategory('all');
      await fetchData();
    } catch (err) {
      showAlert('Error', 'Error eliminando: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  // ── Ingredientes dinámicos ──
  const agregarIngrediente = () => {
    setIngredientes(prev => [...prev, { nombreIngrediente: '', precioExtra: 0, esBase: true, permiteDoble: true }]);
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
    try {
      const [prodRes, catRes] = await Promise.all([
        apiClient.get(`/locales/${LOCAL_ID}/productos`),
        apiClient.get(`/locales/${LOCAL_ID}/categorias`)
      ]);
      setProducts(prodRes.data?.data || []);
      setCategories(catRes.data?.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.categoriaId === activeCategory);

  // ──────────────────────────────
  // MODAL PLATILLO
  // ──────────────────────────────
  const openNew = () => {
    setEditingProduct(null);
    setFormData({ ...emptyForm, id_categoria: categories[0]?.id || '' });
    setIngredientes([]);
    setIsModalOpen(true);
  };

  const openEdit = async (productInfo) => {
    setEditingProduct(productInfo);
    // #24 GET /productos/:id — Obtener detalle completo (incluye ingredientes)
    try {
      const res = await apiClient.get(`/locales/${LOCAL_ID}/productos/${productInfo.id}`);
      const product = res.data.data || productInfo;
      
      setFormData({
        nombre: product.nombre || productInfo.nombre,
        descripcion: product.descripcion || productInfo.descripcion,
        precio_base: product.precioBase || productInfo.precioBase,
        id_categoria: product.categoriaId || productInfo.categoriaId,
        visible_menu: product.visibleMenu ?? productInfo.visibleMenu ?? true,
        disponible: product.disponible ?? productInfo.disponible ?? true,
        imagenFile: null,
        imagenPreview: product.imagenUrl || productInfo.imagenUrl || '',
        imagen_url_existente: product.imagenUrl || productInfo.imagenUrl || ''
      });
      setIngredientes(product.ingredientes || productInfo.ingredientes || []);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error fetching product details', err);
      showAlert('Atención', 'Error cargando detalles del producto. Se usará la info básica.', 'warning');
      // Fallback
      setFormData({
        nombre: productInfo.nombre,
        descripcion: productInfo.descripcion,
        precio_base: productInfo.precioBase,
        id_categoria: productInfo.categoriaId,
        visible_menu: productInfo.visibleMenu,
        disponible: productInfo.disponible ?? true,
        imagenFile: null,
        imagenPreview: productInfo.imagenUrl || '',
        imagen_url_existente: productInfo.imagenUrl || ''
      });
      setIngredientes(productInfo.ingredientes || []);
      setIsModalOpen(true);
    }
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
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.precio_base || !formData.id_categoria) {
      return showAlert('Campos Incompletos', 'Verifique que todos los campos requeridos estén llenos', 'warning');
    }
    setSaving(true);

    try {
      const payload = {
        categoriaId: formData.id_categoria,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precioBase: Number(formData.precio_base),
        visibleMenu: Boolean(formData.visible_menu),
        disponible: Boolean(formData.disponible),
        imagenUrl: formData.imagen_url_existente
      };

      if (formData.imagenFile) {
        payload.imagenUrl = await toBase64(formData.imagenFile);
      }

      if (editingProduct) {
        // ACTUALIZACIÓN
        // 1. Update producto
        await apiClient.patch(`/locales/${LOCAL_ID}/productos/${editingProduct.id}`, payload);

        // 2. Gestionar ingredientes individualmente (Fase 4 - #29, #30, #31)
        const originalIngs = editingProduct.ingredientes || [];
        const finalIngs = ingredientes;

        const deletedIngs = originalIngs.filter(o => !finalIngs.some(f => f.id === o.id));
        const addedIngs = finalIngs.filter(f => !f.id);
        const updatedIngs = finalIngs.filter(f => !!f.id);

        await Promise.all([
          ...deletedIngs.map(ing => 
            apiClient.delete(`/locales/${LOCAL_ID}/productos/${editingProduct.id}/ingredientes/${ing.id}`)
          ),
          ...addedIngs.map(ing => 
            apiClient.post(`/locales/${LOCAL_ID}/productos/${editingProduct.id}/ingredientes`, {
              nombreIngrediente: ing.nombreIngrediente,
              precioExtra: Number(ing.precioExtra) || 0,
              esBase: Boolean(ing.esBase),
              permiteDoble: Boolean(ing.permiteDoble)
            })
          ),
          ...updatedIngs.map(ing => 
            apiClient.patch(`/locales/${LOCAL_ID}/productos/${editingProduct.id}/ingredientes/${ing.id}`, {
              nombreIngrediente: ing.nombreIngrediente,
              precioExtra: Number(ing.precioExtra) || 0,
              esBase: Boolean(ing.esBase),
              permiteDoble: Boolean(ing.permiteDoble)
            })
          )
        ]);

      } else {
        // CREACIÓN
        // Pasamos todos los ingredientes en un chunk, el backend insert los insertará juntos
        payload.ingredientes = ingredientes.map(ing => ({
          nombreIngrediente: ing.nombreIngrediente,
          precioExtra: Number(ing.precioExtra) || 0,
          esBase: Boolean(ing.esBase),
          permiteDoble: Boolean(ing.permiteDoble)
        }));
        await apiClient.post(`/locales/${LOCAL_ID}/productos`, payload);
      }

      await fetchData();
      closeModal();
    } catch (err) {
      console.error('Error al guardar:', err.response?.data || err.message);
      showAlert('Error', 'Error al guardar: Verifique que todos los campos requeridos estén llenos', 'error');
      setSaving(false);
    }
  };

  // ──────────────────────────────
  // TOGGLE VISIBILIDAD & DISPONIBILIDAD
  // ──────────────────────────────
  const handleToggleVisibility = async (product) => {
    const newVal = !product.visibleMenu;
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, visibleMenu: newVal } : p));
    try {
      // #26 PATCH genérico para visibleMenu
      await apiClient.patch(`/locales/${LOCAL_ID}/productos/${product.id}`, { visibleMenu: newVal });
    } catch (err) {
      console.error('Error al cambiar visibilidad:', err.message);
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, visibleMenu: !newVal } : p));
    }
  };

  const handleToggleAvailability = async (product) => {
    const newVal = product.disponible === false ? true : false;
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, disponible: newVal } : p));
    try {
      // #27 PATCH específico para disponibilidad
      await apiClient.patch(`/locales/${LOCAL_ID}/productos/${product.id}/disponibilidad`, { disponible: newVal });
    } catch (err) {
      console.error('Error al cambiar disponibilidad:', err.message);
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, disponible: !newVal } : p));
    }
  };

  // ──────────────────────────────
  // BORRADO LÓGICO
  // ──────────────────────────────
  const handleDelete = async (product) => {
    const isConf = await showConfirm(
      '¿Dar de baja producto?',
      `¿Eliminar "${product.nombre}" del menú? El registro quedará oculto pero no se perderán pedidos históricos.`,
      'Sí, eliminar',
      'warning'
    );
    if (!isConf) return;
    setProducts(prev => prev.filter(p => p.id !== product.id));
    try {
      // #28 DELETE /productos/:id
      await apiClient.delete(`/locales/${LOCAL_ID}/productos/${product.id}`);
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
      <AdminSidebar />

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
          {/* Filtro de categorías + gestión */}
          <div className="admin-category-filter">
            <button
              className={`admin-cat-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              Todos
            </button>
            {categories.map(cat => (
              <div key={cat.id} className="cat-chip-group">
                <button
                  className={`admin-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.nombre}
                </button>
                {/* controles sólo si el chip está activo */}
                {activeCategory === cat.id && (
                  <div className="cat-chip-actions">
                    <button className="cat-chip-btn edit" title="Editar categoría" onClick={() => openEditCat(cat)}>✏️</button>
                    <button className="cat-chip-btn del"  title="Eliminar categoría" onClick={() => handleDeleteCat(cat)}>🗑</button>
                  </div>
                )}
              </div>
            ))}
            <button className="admin-cat-btn cat-btn-add" onClick={openNewCat} title="Nueva categoría">
              <Plus size={15} /> Categoría
            </button>
          </div>

          {loading ? (
            <div className="loading-state">Cargando inventario...</div>
          ) : (
            <div className="admin-products-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className={`admin-product-card ${!product.visibleMenu ? 'hidden-product' : ''}`}>
                  <div className="product-img-container">
                    <span className={`badge-status ${product.visibleMenu ? 'badge-visible' : 'badge-hidden'}`}>
                      {product.visibleMenu ? 'Visible' : 'Oculto'}
                    </span>
                    <img
                      src={product.imagenUrl || 'https://placehold.co/400x200/F5F5DC/8B4513?text=Sin+Imagen'}
                      alt={product.nombre}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/400x200/F5F5DC/8B4513?text=Sin+Imagen';
                      }}
                    />
                  </div>
                  <div className="product-info">
                    <div className="product-info-head">
                      <h3>{product.nombre}</h3>
                      <span className="product-price">${product.precioBase}</span>
                    </div>
                    <p>{product.descripcion}</p>
                  </div>
                  <div className="product-actions" style={{ flexDirection: 'column', gap: '10px', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <label className="visibility-toggle" style={{ flexShrink: 0, margin: 0 }}>
                        <input
                          type="checkbox"
                          checked={product.visibleMenu}
                          onChange={() => handleToggleVisibility(product)}
                        />
                        {product.visibleMenu ? 'Visible en menú' : 'Oculto'}
                      </label>
                      <label className="visibility-toggle" style={{ flexShrink: 0, margin: 0 }}>
                        <input
                          type="checkbox"
                          checked={product.disponible !== false}
                          onChange={() => handleToggleAvailability(product)}
                        />
                        {product.disponible !== false ? '✅ En Stock' : '❌ Agotado'}
                      </label>
                    </div>
                    <div className="action-btns" style={{ alignSelf: 'flex-end' }}>
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

      {/* ── MODAL CATEGORÍAS ─────────────────────────────── */}
      {catModalOpen && (
        <div className="modal-overlay-admin" onClick={() => setCatModalOpen(false)}>
          <div className="modal-content-admin" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header-admin">
              <h2>{editingCat ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <button className="btn-close" onClick={() => setCatModalOpen(false)}><X size={22} /></button>
            </div>
            <form onSubmit={handleSaveCat}>
              <div className="modal-body-admin">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={catForm.nombre}
                    onChange={e => setCatForm(p => ({ ...p, nombre: e.target.value }))}
                    placeholder="Ej: Entradas, Postres..."
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Descripción (opcional)</label>
                  <input
                    type="text"
                    value={catForm.descripcion}
                    onChange={e => setCatForm(p => ({ ...p, descripcion: e.target.value }))}
                    placeholder="Breve descripción de la categoría"
                  />
                </div>
              </div>
              <div className="modal-footer-admin">
                <button type="button" className="btn-secondary" onClick={() => setCatModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={savingCat}>
                  {savingCat ? 'Guardando...' : (editingCat ? 'Actualizar' : 'Crear Categoría')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PLATILLO */}
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
                              <div className="form-group ing-nombre">
                                <label>Nombre</label>
                                <input
                                  type="text"
                                  placeholder="Ej: Queso Extra"
                                  value={ing.nombreIngrediente || ing.nombre}
                                  onChange={e => actualizarIngrediente(index, 'nombreIngrediente', e.target.value)}
                                  required
                                />
                              </div>
                              <div className="form-group ing-precio">
                                <label>Precio Extra ($)</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.50"
                                  value={ing.precioExtra ?? ing.precio_extra ?? 0}
                                  onChange={e => actualizarIngrediente(index, 'precioExtra', parseFloat(e.target.value) || 0)}
                                />
                              </div>
                            </div>
                            <div className="ing-checks">
                              <label>
                                <input
                                  type="checkbox"
                                  checked={ing.esBase ?? ing.es_base}
                                  onChange={e => actualizarIngrediente(index, 'esBase', e.target.checked)}
                                />
                                Ya viene incluido
                              </label>
                              <label>
                                <input
                                  type="checkbox"
                                  checked={ing.permiteDoble ?? ing.permite_doble}
                                  onChange={e => actualizarIngrediente(index, 'permiteDoble', e.target.checked)}
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
