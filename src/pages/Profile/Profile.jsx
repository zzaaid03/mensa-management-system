import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserCard from '../../components/UserCard/UserCard';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import styles from './Profile.module.css';

function Profile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [fetchingData, setFetchingData] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const fetchData = async () => {
    if (!user) return;
    setFetchingData(true);
    try {
      const [ordersRes, reservationsRes] = await Promise.all([
        api.get('/orders/my'),
        api.get('/reservations/my')
      ]);
      setOrders(ordersRes.data);
      setReservations(reservationsRes.data);
    } catch (err) {
      console.error('Failed to fetch profile history from SQLite backend', err);
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this pre-order?')) return;
    try {
      await api.patch(`/orders/${orderId}/cancel`);
      fetchData(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel pre-order.');
    }
  };

  const handleCancelReservation = async (resId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await api.patch(`/reservations/${resId}/cancel`);
      fetchData(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel reservation.');
    }
  };

  const handleEdit = (u) => {
    alert('Edit profile not implemented yet for ' + u.name);
  };

  if (loading || (!user && !loading)) {
    return (
      <div className="container py-8 text-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  const formatDateTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const getOrderStatusBadge = (status) => {
    const normalized = status.toLowerCase();
    let badgeClass = styles.badgePending;
    if (normalized === 'preparing') badgeClass = styles.badgePreparing;
    if (normalized === 'ready') badgeClass = styles.badgeReady;
    if (normalized === 'completed') badgeClass = styles.badgeCompleted;
    if (normalized === 'cancelled') badgeClass = styles.badgeCancelled;

    return <span className={`${styles.badge} ${badgeClass}`}>{status}</span>;
  };

  const getResStatusBadge = (status) => {
    const normalized = status.toLowerCase();
    let badgeClass = styles.badgePending;
    if (normalized === 'confirmed') badgeClass = styles.badgeConfirmed;
    if (normalized === 'cancelled') badgeClass = styles.badgeCancelled;

    return <span className={`${styles.badge} ${badgeClass}`}>{status}</span>;
  };

  const userCardData = {
    name: user.full_name,
    email: user.email,
    role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
    studentId: `S${100000 + user.id}`,
    faculty: user.role === 'admin' ? 'Administration' : 'Computer Science',
    orders: orders.length,
    reservations: reservations.length,
  };

  return (
    <div className="container py-8">
      <h1 className="section-title">My Profile</h1>
      <p className="section-subtitle">Manage your account, pre-orders and reservations.</p>

      <div style={{ maxWidth: 800, marginTop: 24 }}>
        <UserCard user={userCardData} onEditProfile={handleEdit} />
      </div>

      <div className={styles.profileLayout} style={{ maxWidth: 800 }}>
        {/* Pre-orders Section */}
        <div className={styles.historySection}>
          <h2 className={styles.sectionTitle}>🛍️ My Pre-Orders</h2>
          {fetchingData ? (
            <p className={styles.emptyState}>Loading pre-orders...</p>
          ) : orders.length > 0 ? (
            <div className={styles.list}>
              {orders.map((order) => (
                <div key={order.id} className={styles.item}>
                  <div className={styles.itemDetails}>
                    <div className={styles.itemName}>
                      {order.items.map(item => `${item.meal?.name || 'Meal'} (x${item.quantity})`).join(', ')}
                    </div>
                    <div className={styles.itemMeta}>
                      <span>Pickup: <strong>{formatDateTime(order.pickup_time)}</strong></span>
                      <span>Total: <strong>€{order.total_price.toFixed(2)}</strong></span>
                    </div>
                  </div>
                  <div className={styles.itemActions}>
                    {getOrderStatusBadge(order.status)}
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className={styles.cancelBtn}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>You haven't placed any pre-orders yet.</p>
          )}
        </div>

        {/* Reservations Section */}
        <div className={styles.historySection}>
          <h2 className={styles.sectionTitle}>📅 My Table Reservations</h2>
          {fetchingData ? (
            <p className={styles.emptyState}>Loading reservations...</p>
          ) : reservations.length > 0 ? (
            <div className={styles.list}>
              {reservations.map((res) => (
                <div key={res.id} className={styles.item}>
                  <div className={styles.itemDetails}>
                    <div className={styles.itemName}>
                      Table {res.table?.table_number || res.table_id} ({res.number_of_people} guests)
                    </div>
                    <div className={styles.itemMeta}>
                      <span>Time: <strong>{formatDateTime(res.reservation_time)}</strong></span>
                      <span>Location: <strong>{res.table?.location || 'Indoor'}</strong></span>
                    </div>
                  </div>
                  <div className={styles.itemActions}>
                    {getResStatusBadge(res.status)}
                    {res.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancelReservation(res.id)}
                        className={styles.cancelBtn}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>You haven't made any reservations yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
