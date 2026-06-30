import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import styles from './Admin.module.css';

/* ── Tabs ──────────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'orders',        label: '📦 Orders' },
  { id: 'reservations',  label: '📅 Reservations' },
  { id: 'meals',         label: '🍽️ Meals' },
  { id: 'tables',        label: '🪑 Tables' },
];

const ORDER_STATUSES  = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
const RESERV_STATUSES = ['pending', 'confirmed', 'cancelled'];
const CATEGORIES       = ['main', 'side', 'drink', 'dessert'];
const LOCATIONS        = ['indoor', 'outdoor', 'window'];

function Admin() {
  const { user, loading } = useAuth();
  const navigate         = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');

  const [orders,       setOrders]       = useState([]);
  const [reservations, setReservations] = useState([]);
  const [meals,        setMeals]        = useState([]);
  const [tables,       setTables]       = useState([]);
  const [fetching,     setFetching]     = useState(false);

  const [mealForm,    setMealForm]    = useState(resetMealForm());
  const [mealError,   setMealError]   = useState('');
  const [mealSuccess, setMealSuccess] = useState('');

  const [tableForm,    setTableForm]    = useState(resetTableForm());
  const [tableError,   setTableError]   = useState('');
  const [tableSuccess, setTableSuccess] = useState('');

  function resetMealForm() {
    return { name: '', price: '', category: 'main', description: '', calories: '', protein: '', carbs: '', fat: '', allergens: '', is_available: true, editingId: null };
  }
  function resetTableForm() {
    return { table_number: '', seats: '', location: 'indoor', is_available: true, editingId: null };
  }

  /* ── Auth guard ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  /* ── Data fetching ──────────────────────────────────────────────────────── */
  const fetchData = useCallback(async () => {
    setFetching(true);
    try {
      const [oRes, rRes, mRes, tRes] = await Promise.all([
        api.get('/admin/orders'),
        api.get('/admin/reservations'),
        api.get('/meals'),
        api.get('/tables'),
      ]);
      setOrders(oRes.data);
      setReservations(rRes.data);
      setMeals(mRes.data);
      setTables(tRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { if (user?.role === 'admin') fetchData(); }, [fetchData, user]);

  /* ── Status updates ────────────────────────────────────────────────────── */
  const updateOrderStatus = async (orderId, newStatus) => {
    try { await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus }); fetchData(); }
    catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  const updateReservStatus = async (resId, newStatus) => {
    try { await api.patch(`/admin/reservations/${resId}/status`, { status: newStatus }); fetchData(); }
    catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  /* ── Meal CRUD ──────────────────────────────────────────────────────────── */
  const handleMealSubmit = async (e) => {
    e.preventDefault();
    setMealError(''); setMealSuccess('');
    const payload = {
      name: mealForm.name,
      price: parseFloat(mealForm.price),
      category: mealForm.category,
      description: mealForm.description || undefined,
      calories: mealForm.calories ? parseInt(mealForm.calories) : undefined,
      protein: mealForm.protein ? parseFloat(mealForm.protein) : undefined,
      carbs: mealForm.carbs ? parseFloat(mealForm.carbs) : undefined,
      fat: mealForm.fat ? parseFloat(mealForm.fat) : undefined,
      allergens: mealForm.allergens ? mealForm.allergens.split(',').map(s => s.trim()).filter(Boolean) : [],
      is_available: mealForm.is_available,
    };
    try {
      if (mealForm.editingId) {
        await api.put(`/admin/meals/${mealForm.editingId}`, payload);
        setMealSuccess('Meal updated!');
      } else {
        await api.post('/admin/meals', payload);
        setMealSuccess('Meal created!');
      }
      setMealForm(resetMealForm());
      fetchData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setMealError(typeof detail === 'string' ? detail : 'Failed to save meal');
    }
  };

  const editMeal = (meal) => {
    setMealForm({
      name: meal.name, price: String(meal.price), category: meal.category || 'main',
      description: meal.description || '', calories: meal.calories != null ? String(meal.calories) : '',
      protein: meal.protein != null ? String(meal.protein) : '', carbs: meal.carbs != null ? String(meal.carbs) : '',
      fat: meal.fat != null ? String(meal.fat) : '', allergens: (meal.allergens || []).join(', '),
      is_available: meal.is_available, editingId: meal.id,
    });
    setActiveTab('meals');
  };

  const deleteMeal = async (mealId) => {
    if (!window.confirm('Delete this meal permanently?')) return;
    try { await api.delete(`/admin/meals/${mealId}`); fetchData(); }
    catch (err) { alert(err.response?.data?.detail || 'Failed to delete meal'); }
  };

  const toggleMealAvail = async (meal) => {
    try { await api.put(`/admin/meals/${meal.id}`, { is_available: !meal.is_available }); fetchData(); }
    catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  /* ── Table CRUD ─────────────────────────────────────────────────────────── */
  const handleTableSubmit = async (e) => {
    e.preventDefault();
    setTableError(''); setTableSuccess('');
    const payload = {
      table_number: parseInt(tableForm.table_number, 10),
      seats: parseInt(tableForm.seats, 10),
      location: tableForm.location,
      is_available: tableForm.is_available,
    };
    try {
      if (tableForm.editingId) {
        await api.put(`/admin/tables/${tableForm.editingId}`, payload);
        setTableSuccess('Table updated!');
      } else {
        await api.post('/admin/tables', payload);
        setTableSuccess('Table created!');
      }
      setTableForm(resetTableForm());
      fetchData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setTableError(typeof detail === 'string' ? detail : 'Failed to save table');
    }
  };

  const editTable = (table) => {
    setTableForm({
      table_number: String(table.table_number), seats: String(table.seats),
      location: table.location || 'indoor', is_available: table.is_available, editingId: table.id,
    });
    setActiveTab('tables');
  };

  const deleteTable = async (tableId) => {
    if (!window.confirm('Delete this table permanently?')) return;
    try { await api.delete(`/admin/tables/${tableId}`); fetchData(); }
    catch (err) { alert(err.response?.data?.detail || 'Failed to delete table'); }
  };

  const toggleTableAvail = async (table) => {
    try { await api.put(`/admin/tables/${table.id}`, { is_available: !table.is_available }); fetchData(); }
    catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  /* ── Helpers ────────────────────────────────────────────────────────────── */
  const fmt = (iso) => iso ? new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  const statusBadge = (status, kind) => {
    const map = kind === 'order'
      ? { pending: styles.badgePending, preparing: styles.badgePreparing, ready: styles.badgeReady, completed: styles.badgeCompleted, cancelled: styles.badgeCancelled }
      : { pending: styles.badgePending, confirmed: styles.badgeConfirmed, cancelled: styles.badgeCancelled };
    return <span className={`${styles.badge} ${map[status] || styles.badgePending}`}>{status}</span>;
  };

  if (loading || !user) return <div className="container py-8 text-center"><p>Loading...</p></div>;
  if (user.role !== 'admin') return null;

  return (
    <div className="container py-8">
      <h1 className="section-title">🔧 Admin Dashboard</h1>
      <p className="section-subtitle">Accept orders, manage reservations, add meals, and configure tables.</p>

      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t.id} className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
        ))}
        <button className={styles.refreshBtn} onClick={fetchData} title="Refresh">🔄</button>
      </div>
      {fetching && <p className={styles.loadingHint}>Refreshing...</p>}

      {/* ═══ ORDERS ═══ */}
      {activeTab === 'orders' && (
        <div className={styles.tabContent}>
          <h2>All Orders</h2>
          {orders.length === 0 ? <p className={styles.empty}>No orders yet.</p> : (
            <div className={styles.list}>
              {orders.map(o => (
                <div key={o.id} className={styles.card}>
                  <div className={styles.cardHeader}><strong>#{o.id}</strong> {o.user?.full_name} {statusBadge(o.status, 'order')}</div>
                  <div className={styles.cardBody}>
                    <div className={styles.items}>{(o.items || []).map(it => <span key={it.id} className={styles.item}>{it.meal?.name || 'Meal'} x{it.quantity}</span>)}</div>
                    <div className={styles.meta}><span>Pickup: {fmt(o.pickup_time)}</span><span>€{o.total_price?.toFixed(2)}</span></div>
                  </div>
                  <div className={styles.cardActions}>
                    <select className={styles.statusSelect} value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}>
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ RESERVATIONS ═══ */}
      {activeTab === 'reservations' && (
        <div className={styles.tabContent}>
          <h2>All Reservations</h2>
          {reservations.length === 0 ? <p className={styles.empty}>No reservations yet.</p> : (
            <div className={styles.list}>
              {reservations.map(r => (
                <div key={r.id} className={styles.card}>
                  <div className={styles.cardHeader}><strong>#{r.id}</strong> {r.user?.full_name} {statusBadge(r.status, 'reservation')}</div>
                  <div className={styles.cardBody}>
                    <div className={styles.meta}><span>Table {r.table?.table_number} ({r.table?.location})</span><span>{r.number_of_people} guests</span><span>{fmt(r.reservation_time)}</span></div>
                  </div>
                  <div className={styles.cardActions}>
                    <select className={styles.statusSelect} value={r.status} onChange={e => updateReservStatus(r.id, e.target.value)}>
                      {RESERV_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ MEALS ═══ */}
      {activeTab === 'meals' && (
        <div className={styles.tabContent}>
          <h2>Manage Meals</h2>
          <form className={styles.form} onSubmit={handleMealSubmit}>
            <h3>{mealForm.editingId ? 'Edit Meal' : 'Add New Meal'}</h3>
            {mealError && <div className={styles.errBanner}>{mealError}</div>}
            {mealSuccess && <div className={styles.okBanner}>{mealSuccess}</div>}
            <div className={styles.formRow}>
              <input className={styles.input} placeholder="Meal name *" value={mealForm.name} onChange={e => setMealForm(p => ({...p, name: e.target.value}))} required />
              <input className={styles.input} style={{width:120}} type="number" step="0.01" min="0" placeholder="Price *" value={mealForm.price} onChange={e => setMealForm(p => ({...p, price: e.target.value}))} required />
              <select className={styles.select} value={mealForm.category} onChange={e => setMealForm(p => ({...p, category: e.target.value}))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <textarea className={styles.textarea} placeholder="Description" rows={2} value={mealForm.description} onChange={e => setMealForm(p => ({...p, description: e.target.value}))} />
            <div className={styles.formRow}>
              <input className={styles.input} type="number" placeholder="Calories" value={mealForm.calories} onChange={e => setMealForm(p => ({...p, calories: e.target.value}))} />
              <input className={styles.input} type="number" step="0.1" placeholder="Protein g" value={mealForm.protein} onChange={e => setMealForm(p => ({...p, protein: e.target.value}))} />
              <input className={styles.input} type="number" step="0.1" placeholder="Carbs g" value={mealForm.carbs} onChange={e => setMealForm(p => ({...p, carbs: e.target.value}))} />
              <input className={styles.input} type="number" step="0.1" placeholder="Fat g" value={mealForm.fat} onChange={e => setMealForm(p => ({...p, fat: e.target.value}))} />
            </div>
            <input className={styles.input} placeholder="Allergens (comma separated)" value={mealForm.allergens} onChange={e => setMealForm(p => ({...p, allergens: e.target.value}))} />
            <label className={styles.checkbox}><input type="checkbox" checked={mealForm.is_available} onChange={e => setMealForm(p => ({...p, is_available: e.target.checked}))} /> Available Today</label>
            <div className={styles.formActions}>
              <button type="submit" className={styles.saveBtn}>{mealForm.editingId ? 'Update Meal' : 'Add Meal'}</button>
              {mealForm.editingId && <button type="button" className={styles.cancelBtn} onClick={() => setMealForm(resetMealForm())}>Cancel</button>}
            </div>
          </form>
          <div className={styles.list} style={{marginTop:24}}>
            {meals.map(m => (
              <div key={m.id} className={`${styles.card} ${!m.is_available ? styles.cardDisabled : ''}`}>
                <div className={styles.cardHeader}><strong>{m.name}</strong><span className={styles.price}>€{m.price?.toFixed(2)}</span></div>
                <div className={styles.meta}><span>{m.category}</span><span>{m.calories} kcal</span><span className={m.is_available ? styles.availYes : styles.availNo}>{m.is_available ? 'Available' : 'Unavailable'}</span></div>
                <div className={styles.cardActions}>
                  <button className={styles.smallBtn} onClick={() => toggleMealAvail(m)}>{m.is_available ? 'Mark Unavailable' : 'Mark Available'}</button>
                  <button className={styles.smallBtn} onClick={() => editMeal(m)}>Edit</button>
                  <button className={`${styles.smallBtn} ${styles.dangerBtn}`} onClick={() => deleteMeal(m.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ TABLES ═══ */}
      {activeTab === 'tables' && (
        <div className={styles.tabContent}>
          <h2>Manage Tables</h2>
          <form className={styles.form} onSubmit={handleTableSubmit}>
            <h3>{tableForm.editingId ? 'Edit Table' : 'Add New Table'}</h3>
            {tableError && <div className={styles.errBanner}>{tableError}</div>}
            {tableSuccess && <div className={styles.okBanner}>{tableSuccess}</div>}
            <div className={styles.formRow}>
              <input className={styles.input} style={{width:140}} type="number" min="1" placeholder="Table number *" value={tableForm.table_number} onChange={e => setTableForm(p => ({...p, table_number: e.target.value}))} required />
              <input className={styles.input} style={{width:120}} type="number" min="1" placeholder="Seats *" value={tableForm.seats} onChange={e => setTableForm(p => ({...p, seats: e.target.value}))} required />
              <select className={styles.select} value={tableForm.location} onChange={e => setTableForm(p => ({...p, location: e.target.value}))}>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <label className={styles.checkbox}><input type="checkbox" checked={tableForm.is_available} onChange={e => setTableForm(p => ({...p, is_available: e.target.checked}))} /> Available</label>
            <div className={styles.formActions}>
              <button type="submit" className={styles.saveBtn}>{tableForm.editingId ? 'Update Table' : 'Add Table'}</button>
              {tableForm.editingId && <button type="button" className={styles.cancelBtn} onClick={() => setTableForm(resetTableForm())}>Cancel</button>}
            </div>
          </form>
          <div className={styles.list} style={{marginTop:24}}>
            {tables.map(t => (
              <div key={t.id} className={`${styles.card} ${!t.is_available ? styles.cardDisabled : ''}`}>
                <div className={styles.cardHeader}><strong>Table {t.table_number}</strong><span>{t.seats} seats</span></div>
                <div className={styles.meta}><span>{t.location}</span><span className={t.is_available ? styles.availYes : styles.availNo}>{t.is_available ? 'Available' : 'Unavailable'}</span></div>
                <div className={styles.cardActions}>
                  <button className={styles.smallBtn} onClick={() => toggleTableAvail(t)}>{t.is_available ? 'Mark Unavailable' : 'Mark Available'}</button>
                  <button className={styles.smallBtn} onClick={() => editTable(t)}>Edit</button>
                  <button className={`${styles.smallBtn} ${styles.dangerBtn}`} onClick={() => deleteTable(t.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
