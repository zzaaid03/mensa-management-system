import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserCard from '../../components/UserCard/UserCard';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

function Profile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ orders: 0, reservations: 0 });
  const [fetchingStats, setFetchingStats] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;

    async function fetchStats() {
      setFetchingStats(true);
      try {
        const [ordersRes, reservationsRes] = await Promise.all([
          api.get('/orders/my'),
          api.get('/reservations/my')
        ]);
        setStats({
          orders: ordersRes.data.length,
          reservations: reservationsRes.data.length
        });
      } catch (err) {
        console.error('Failed to fetch profile stats from SQLite backend', err);
      } finally {
        setFetchingStats(false);
      }
    }

    fetchStats();
  }, [user]);

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

  const userCardData = {
    name: user.full_name,
    email: user.email,
    role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
    studentId: `S${100000 + user.id}`,
    faculty: user.role === 'admin' ? 'Administration' : 'Computer Science',
    orders: stats.orders,
    reservations: stats.reservations,
  };

  return (
    <div className="container py-8">
      <h1 className="section-title">My Profile</h1>
      <p className="section-subtitle">Manage your account, pre-orders and reservations.</p>

      <div style={{ maxWidth: 800, marginTop: 24 }}>
        <UserCard user={userCardData} onEditProfile={handleEdit} />
      </div>
    </div>
  );
}

export default Profile;
