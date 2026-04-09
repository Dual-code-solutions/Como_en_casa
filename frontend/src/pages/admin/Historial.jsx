import React, { useEffect, useState } from 'react';
import {
  Search, ChevronDown, ChevronUp, MapPin, Clock, ShoppingBag, TrendingUp, Package, FileText, Calculator, ClipboardList
} from 'lucide-react';
import apiClient from '../../api/apiClient';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { showAlert, showConfirm } from '../../utils/swalCustom';
import './AdminDashboard.css';
import './Historial.css';

const LOCAL_ID = '02ef18a9-62aa-4fcd-98ee-1134e4aaf197';

const modalidadMap = {
  local: 'En Local',
  domicilio: 'Domicilio',
  pasar_a_recoger: 'Para Llevar'
};

const Historial = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');
  const [filterModal, setFilterModal] = useState('all');

  const getLocalToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const hoy = getLocalToday();
  const [activeTab, setActiveTab] = useState('pedidos'); // 'pedidos' | 'cortes'
  const [cortes, setCortes] = useState([]);
  const [loadingCortes, setLoadingCortes] = useState(false);
  const [yaHizoCorteHoy, setYaHizoCorteHoy] = useState(false);
  
  // Para ver un día específico tras hacer clic en un corte
  const [viewDate, setViewDate] = useState(hoy);
  const [viewingSpecificCorte, setViewingSpecificCorte] = useState(false);

  const fetchCortes = async () => {
    setLoadingCortes(true);
    try {
      const res = await apiClient.get(`/locales/${LOCAL_ID}/cortes`);
      if (res.data?.data) {
        setCortes(res.data.data);
        setYaHizoCorteHoy(res.data.data.some(c => c.fechaCorte === hoy));
      }
    } catch (e) { console.error(e); }
    setLoadingCortes(false);
  };

  const handleGenerarCorte = async () => {
    const isConfirmed = await showConfirm(
      '¿Generar corte de caja del día de hoy?',
      'Esto encapsulará todas las ventas de hoy y cerrará la caja.',
      'Sí, generar corte',
      'warning'
    );
    if (!isConfirmed) return;
    
    try {
      await apiClient.post(`/locales/${LOCAL_ID}/cortes`);
      showAlert('¡Éxito!', 'Corte generado correctamente', 'success');
      fetchCortes();
    } catch (err) {
      showAlert('Error', 'Error generando corte: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const fetchHistorial = async (fecha) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/orders?localId=${LOCAL_ID}&limit=200&fecha=${fecha}`);
      if (res.data?.data) {
        const done = res.data.data.filter(o =>
          o.estado === 'finalizado' || o.estado === 'cancelado'
        );
        setOrders(done);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // Traer los cortes al iniciar para saber si ya se cerró la caja
  useEffect(() => {
    fetchCortes();
  }, []);

  useEffect(() => { 
    if (activeTab === 'pedidos') {
      fetchHistorial(viewDate);
    }
  }, [activeTab, viewDate]);

  // Si estamos en "Pedidos de Hoy" y hay cortes generados hoy, descartamos los pedidos que ya entraron en cortes anteriores
  let shiftOrders = orders;
  if (!viewingSpecificCorte && viewDate === hoy) {
    const ultimoCorte = cortes.filter(c => c.fechaCorte === hoy)[0];
    if (ultimoCorte) {
      const thresholdTime = new Date(ultimoCorte.cerradoAt).getTime();
      shiftOrders = orders.filter(o => new Date(o.creadoAt).getTime() > thresholdTime);
    }
  }

  const totalVentas = shiftOrders
    .filter(o => o.estado === 'finalizado')
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  const entregadosCount = shiftOrders.filter(o => o.estado === 'finalizado').length;
  const canceladosCount = shiftOrders.filter(o => o.estado === 'cancelado').length;

  const filtered = shiftOrders.filter(o => {
    const matchSearch =
      o.nombreCliente?.toLowerCase().includes(search.toLowerCase()) ||
      String(o.numOrdenDia).includes(search);
    const matchModal = filterModal === 'all' || o.modalidad === filterModal;
    return matchSearch && matchModal;
  });

  const toggleExpand = (id) => setExpanded(prev => prev === id ? null : id);

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Función explícita para la pestaña de "Pedidos de Hoy"
  const clickTabPedidos = () => {
    setViewingSpecificCorte(false);
    setViewDate(hoy);
    setActiveTab('pedidos');
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="dashboard-main">
        <header className="dashboard-header" style={{ borderBottom: 'none', paddingBottom: '1rem' }}>
          <div className="header-info">
            <h1 className="dashboard-title">Historial y Finanzas</h1>
            <p className="dashboard-subtitle">
              {viewingSpecificCorte 
                ? `Mostrando pedidos encapsulados del corte: ${viewDate}` 
                : 'Registro en tiempo real de ventas no encapsuladas.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {activeTab === 'cortes' && !yaHizoCorteHoy && (
              <button className="btn-new-product" style={{ background: '#10b981' }} onClick={handleGenerarCorte}>
                <Calculator size={16} /> Cerrar Caja Hoy
              </button>
            )}
            <button className="btn-refresh" onClick={() => {
              if (activeTab === 'pedidos') {
                 if (viewingSpecificCorte || !yaHizoCorteHoy) fetchHistorial(viewDate);
              } else fetchCortes();
            }} title="Actualizar">
              ↺ Actualizar
            </button>
          </div>
        </header>

        <div className="admin-category-tabs" style={{ padding: '0 2rem 1rem', marginBottom: '1rem' }}>
          <button
            className={`cat-tab-btn ${activeTab === 'pedidos' ? 'active' : ''}`}
            onClick={clickTabPedidos}
          >
            {viewingSpecificCorte ? 'Volver a Hoy' : 'Pedidos de Hoy'}
          </button>
          <button
            className={`cat-tab-btn ${activeTab === 'cortes' ? 'active' : ''}`}
            onClick={() => setActiveTab('cortes')}
          >
            Cortes de Caja
          </button>
        </div>

        {activeTab === 'pedidos' ? (
          <div className="historial-content">
            <div className="historial-kpis">
              <div className="kpi-card kpi-green">
                <TrendingUp size={28} />
                <div>
                  <p className="kpi-label">Total ventas</p>
                  <p className="kpi-value">${totalVentas.toFixed(2)}</p>
                </div>
              </div>
              <div className="kpi-card kpi-brown">
                <Package size={28} />
                <div>
                  <p className="kpi-label">Pedidos entregados</p>
                  <p className="kpi-value">{entregadosCount}</p>
                </div>
              </div>
              <div className="kpi-card kpi-red">
                <ShoppingBag size={28} />
                <div>
                  <p className="kpi-label">Cancelados</p>
                  <p className="kpi-value">{canceladosCount}</p>
                </div>
              </div>
            </div>

            <div className="historial-filters">
              <div className="search-box">
                <Search size={15} className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar por cliente o # de orden…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="filter-pills">
                {['all', 'local', 'domicilio', 'pasar_a_recoger'].map(m => (
                  <button
                    key={m}
                    className={`filter-pill ${filterModal === m ? 'active' : ''}`}
                    onClick={() => setFilterModal(m)}
                  >
                    {m === 'all' ? 'Todos' : modalidadMap[m]}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="loading-state">Cargando historial…</div>
            ) : filtered.length === 0 ? (
              <div className="historial-empty">
                <ClipboardList size={52} color="#ccc" />
                <p>No hay pedidos en el historial de la caja activa actual.</p>
              </div>
            ) : (
              <div className="historial-list">
                {filtered.map(order => (
                  <div key={order.id} className={`historial-row ${order.estado === 'cancelado' ? 'row-cancelado' : ''}`}>
                    <div className="row-main" onClick={() => toggleExpand(order.id)}>
                      <div className="row-left">
                        <span className={`row-estado-badge row-badge-${order.estado}`}>
                          {order.estado === 'finalizado' ? '✓ Entregado' : '✕ Cancelado'}
                        </span>
                        <div className="row-info">
                          <p className="row-client">{order.nombreCliente}</p>
                          <p className="row-meta">
                            <Clock size={12} /> {formatDate(order.creadoAt)}
                            &nbsp;·&nbsp;
                            <MapPin size={12} /> {modalidadMap[order.modalidad] || order.modalidad}
                            {order.mesaId && ` · Mesa ${order.mesaId}`}
                          </p>
                        </div>
                      </div>
                      <div className="row-right">
                        <span className="row-orden-num">#{String(order.numOrdenDia || order.id.slice(-3)).padStart(3,'0')}</span>
                        <span className="row-total-amt">${Number(order.total).toFixed(2)}</span>
                        {expanded === order.id ? <ChevronUp size={16} color="#999"/> : <ChevronDown size={16} color="#999"/>}
                      </div>
                    </div>

                    {expanded === order.id && (
                      <div className="row-detail">
                        <table className="detail-table">
                          <thead>
                            <tr><th>Cant.</th><th>Producto</th><th>Subtotal</th></tr>
                          </thead>
                          <tbody>
                            {order.items?.map((item, i) => (
                              <tr key={i}>
                                <td>{item.cantidad || 1}×</td>
                                <td>{item.productos?.nombre || 'Producto'}</td>
                                <td>${Number(item.subtotal * (item.cantidad || 1)).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="detail-footer-row">
                          <span>Total cobrado</span>
                          <strong>${Number(order.total).toFixed(2)}</strong>
                        </div>
                        {order.motivoCancelacion && (
                          <div className="detail-cancel-note">
                            <strong>Motivo:</strong> {order.motivoCancelacion}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="historial-content">
            {loadingCortes ? (
              <div className="loading-state">Cargando cortes...</div>
            ) : cortes.length === 0 ? (
              <div className="historial-empty">
                <FileText size={52} color="#ccc" />
                <p>No se han generado cortes de caja.</p>
              </div>
            ) : (
              <div className="cortes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {cortes.map(c => (
                  <div 
                    key={c.id} 
                    className="kpi-card hoverable-corte" 
                    style={{ 
                      flexDirection: 'column', 
                      alignItems: 'flex-start', 
                      background: '#fff', 
                      border: '1px solid #edf2f7',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onClick={() => {
                       setViewDate(c.fechaCorte);
                       setViewingSpecificCorte(true);
                       setActiveTab('pedidos');
                    }}
                    title="Clic para ver los pedidos de este corte"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                      <span style={{ fontWeight: '600', color: '#4a5568' }}>{new Date(c.fechaCorte).toLocaleDateString()}</span>
                      <span style={{ fontSize: '0.8rem', color: '#718096' }}>#{c.id.substring(0, 8)}</span>
                    </div>
                    <div style={{ padding: '10px 0', borderTop: '1px solid #edf2f7', borderBottom: '1px solid #edf2f7', width: '100%', margin: '10px 0' }}>
                      <p style={{ margin: '0 0 5px', fontSize: '0.9rem', color: '#718096' }}>Ingresos Totales</p>
                      <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>${Number(c.totalIngresosDia).toFixed(2)}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#a0aec0' }}>Local</p>
                        <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>{c.conteoPedidosLocal}</p>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#a0aec0' }}>Llevar</p>
                        <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>{c.conteoPedidosLlevar}</p>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#a0aec0' }}>Domicilio</p>
                        <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>{c.conteoPedidosDomicilio}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Historial;
